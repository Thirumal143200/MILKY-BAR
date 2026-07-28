/**
 * @module mobile/store/sync.store
 * Persistent offline scan queue state management.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OfflineScanStatus =
  'pending' | 'uploading' | 'syncing' | 'synced' | 'failed' | 'cancelled';

export type OfflineScan = {
  id: string; // clientScanId
  imageUri: string;
  timestamp: number;
  status: OfflineScanStatus;
  title?: string;
  notes?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  retryCount?: number;
  lastAttemptAt?: number;
  errorMessage?: string;
  prediction?: unknown;
  serverId?: string;
};

interface SyncState {
  queue: OfflineScan[];
  isSyncing: boolean;
  isPaused: boolean;
  lastSyncedAt?: number;

  // Actions
  addScan: (scan: Partial<OfflineScan> & { id: string; imageUri: string }) => void;
  updateScanStatus: (
    id: string,
    status: OfflineScanStatus,
    extra?: { prediction?: unknown; serverId?: string; errorMessage?: string },
  ) => void;
  incrementRetryCount: (id: string, errorMsg?: string) => void;
  retryScan: (id: string) => void;
  cancelScan: (id: string) => void;
  removeScan: (id: string) => void;
  getPendingScans: () => OfflineScan[];
  clearSyncedQueue: () => void;
  clearFailedQueue: () => void;
  pauseSync: () => void;
  resumeSync: () => void;
  setSyncing: (syncing: boolean) => void;
  resetQueue: () => void;
}

// Visual path obfuscation to simulate local file path encryption
const encryptPath = (path: string): string => {
  if (!path) return path;
  if (path.startsWith('obf:')) return path;
  try {
    return (
      'obf:' +
      path
        .split('')
        .map((c) => String.fromCharCode(c.charCodeAt(0) + 1))
        .join('')
    );
  } catch {
    return path;
  }
};

const decryptPath = (obfPath: string): string => {
  if (!obfPath) return obfPath;
  if (obfPath.startsWith('obf:')) {
    try {
      return obfPath
        .substring(4)
        .split('')
        .map((c) => String.fromCharCode(c.charCodeAt(0) - 1))
        .join('');
    } catch {
      return obfPath;
    }
  }
  return obfPath;
};

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,
      isPaused: false,
      lastSyncedAt: undefined,

      addScan: (scan) => {
        const currentQueue = get().queue;
        // Duplicate detection guard
        if (currentQueue.some((item) => item.id === scan.id)) {
          return;
        }

        const newScan: OfflineScan = {
          id: scan.id,
          imageUri: encryptPath(scan.imageUri),
          timestamp: scan.timestamp || Date.now(),
          status: 'pending',
          title: scan.title || `Offline Scan ${scan.id.substring(0, 6)}`,
          notes: scan.notes,
          location: scan.location,
          retryCount: 0,
        };

        set((state) => ({ queue: [...state.queue, newScan] }));
      },

      updateScanStatus: (id, status, extra) =>
        set((state) => ({
          queue: state.queue.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status,
                  prediction: extra?.prediction ?? s.prediction,
                  serverId: extra?.serverId ?? s.serverId,
                  errorMessage: extra?.errorMessage ?? s.errorMessage,
                }
              : s,
          ),
          lastSyncedAt: status === 'synced' ? Date.now() : state.lastSyncedAt,
        })),

      incrementRetryCount: (id, errorMsg) =>
        set((state) => ({
          queue: state.queue.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: 'failed',
                  retryCount: (s.retryCount || 0) + 1,
                  lastAttemptAt: Date.now(),
                  errorMessage: errorMsg || s.errorMessage,
                }
              : s,
          ),
        })),

      retryScan: (id) =>
        set((state) => ({
          queue: state.queue.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: 'pending',
                  errorMessage: undefined,
                }
              : s,
          ),
        })),

      cancelScan: (id) =>
        set((state) => ({
          queue: state.queue.map((s) => (s.id === id ? { ...s, status: 'cancelled' } : s)),
        })),

      removeScan: (id) => set((state) => ({ queue: state.queue.filter((s) => s.id !== id) })),

      getPendingScans: () =>
        get()
          .queue.filter((s) => s.status === 'pending' || s.status === 'failed')
          .map((s) => ({ ...s, imageUri: decryptPath(s.imageUri) })),

      clearSyncedQueue: () =>
        set((state) => ({
          queue: state.queue.filter((s) => s.status !== 'synced'),
        })),

      clearFailedQueue: () =>
        set((state) => ({
          queue: state.queue.filter((s) => s.status !== 'failed' && s.status !== 'cancelled'),
        })),

      pauseSync: () => set({ isPaused: true }),
      resumeSync: () => set({ isPaused: false }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      resetQueue: () => set({ queue: [], isSyncing: false, isPaused: false }),
    }),
    {
      name: 'milkboy-offline-sync-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
