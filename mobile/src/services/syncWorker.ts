/**
 * @module mobile/services/syncWorker
 * Dedicated background synchronization engine for offline scan queue.
 */

import axios from 'axios';
import { networkService } from './network.service';
import { useSyncStore } from '../store/sync.store';
import type { OfflineScan } from '../store/sync.store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BatchSyncPayload, BatchSyncResponse } from '@milkboy/shared';

const API_BASE_URL = 'http://localhost:5000/api/v1'; // Default development server endpoint
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 60000;
const JITTER_MS = 500;
const MAX_RETRIES = 5;

export class SyncWorker {
  private unsubscribeNetwork: (() => void) | null = null;
  private isProcessing = false;

  constructor() {
    this.init();
  }

  private init() {
    // Subscribe to network connection state changes
    this.unsubscribeNetwork = networkService.subscribe((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.triggerSync().catch(() => {});
      }
    });
  }

  /**
   * Calculate exponential backoff delay with random jitter.
   */
  public calculateBackoff(retryCount: number): number {
    const exponent = Math.min(retryCount, 6);
    const delay = BASE_DELAY_MS * Math.pow(2, exponent);
    const jitter = Math.random() * JITTER_MS;
    return Math.min(MAX_DELAY_MS, delay + jitter);
  }

  /**
   * Check whether a scan item is ready for retry based on backoff delay.
   */
  public isReadyForRetry(scan: OfflineScan): boolean {
    if (scan.status === 'cancelled') return false;
    if ((scan.retryCount || 0) >= MAX_RETRIES) return false;
    if (!scan.lastAttemptAt) return true;

    const delay = this.calculateBackoff(scan.retryCount || 0);
    return Date.now() - scan.lastAttemptAt >= delay;
  }

  /**
   * Trigger queue synchronization.
   */
  public async triggerSync(): Promise<{ synced: number; failed: number }> {
    const store = useSyncStore.getState();

    if (this.isProcessing || store.isSyncing || store.isPaused) {
      return { synced: 0, failed: 0 };
    }

    if (!networkService.isOnline()) {
      return { synced: 0, failed: 0 };
    }

    const pendingScans = store.getPendingScans().filter((s) => this.isReadyForRetry(s));

    if (pendingScans.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.isProcessing = true;
    store.setSyncing(true);

    let syncedTotal = 0;
    let failedTotal = 0;

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        // Cannot sync without active authentication session
        store.setSyncing(false);
        this.isProcessing = false;
        return { synced: 0, failed: 0 };
      }

      // Mark items as uploading
      pendingScans.forEach((scan) => store.updateScanStatus(scan.id, 'uploading'));

      // Build batch payload items
      const batchItems = await Promise.all(
        pendingScans.map(async (scan) => {
          let base64Data: string | undefined;

          if (scan.imageUri) {
            try {
              // Attempt reading base64 data if available in web/React Native environment
              if (scan.imageUri.startsWith('data:image')) {
                base64Data = scan.imageUri.split(',')[1];
              }
            } catch {
              // Ignore image data load error; fallback metadata will be sent
            }
          }

          return {
            clientScanId: scan.id,
            timestamp: scan.timestamp,
            title: scan.title,
            notes: scan.notes,
            location: scan.location,
            imageData: base64Data
              ? {
                  filename: `${scan.id}.jpg`,
                  mimeType: 'image/jpeg',
                  base64Data,
                }
              : undefined,
          };
        }),
      );

      const payload: BatchSyncPayload = { scans: batchItems };

      const response = await axios.post<BatchSyncResponse>(
        `${API_BASE_URL}/scans/batch-sync`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const batchResult = response.data;

      if (batchResult && Array.isArray(batchResult.results)) {
        for (const itemResult of batchResult.results) {
          if (itemResult.status === 'synced' || itemResult.status === 'duplicate') {
            store.updateScanStatus(itemResult.clientScanId, 'synced', {
              serverId: itemResult.serverId,
              prediction: itemResult.scanResult?.predictions,
            });
            syncedTotal++;
          } else {
            store.incrementRetryCount(
              itemResult.clientScanId,
              itemResult.error || 'Server rejected batch item',
            );
            failedTotal++;
          }
        }
      }

      // Automatically clean up successfully synced items from queue
      store.clearSyncedQueue();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Network batch upload failed';

      pendingScans.forEach((scan) => {
        store.incrementRetryCount(scan.id, errorMsg);
      });
      failedTotal += pendingScans.length;
    } finally {
      this.isProcessing = false;
      store.setSyncing(false);
    }

    return { synced: syncedTotal, failed: failedTotal };
  }

  public destroy() {
    if (this.unsubscribeNetwork) {
      this.unsubscribeNetwork();
    }
  }
}

export const syncWorker = new SyncWorker();
