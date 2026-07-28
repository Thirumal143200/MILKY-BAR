/**
 * @module mobile/services/__tests__/syncWorker.test
 * Unit tests for sync worker backoff & queue filtering logic.
 */

import { describe, it, expect } from 'vitest';
import { syncWorker } from '../syncWorker';
import type { OfflineScan } from '../../store/sync.store';

describe('Sync Worker Unit Tests', () => {
  it('should calculate exponential backoff delay correctly', () => {
    const delay0 = syncWorker.calculateBackoff(0);
    const delay1 = syncWorker.calculateBackoff(1);
    const delay2 = syncWorker.calculateBackoff(2);

    expect(delay0).toBeGreaterThanOrEqual(1000);
    expect(delay0).toBeLessThanOrEqual(1500);

    expect(delay1).toBeGreaterThanOrEqual(2000);
    expect(delay1).toBeLessThanOrEqual(2500);

    expect(delay2).toBeGreaterThanOrEqual(4000);
    expect(delay2).toBeLessThanOrEqual(4500);
  });

  it('should evaluate isReadyForRetry correctly', () => {
    const scanNew: OfflineScan = {
      id: 'scan-1',
      imageUri: 'file:///path/1.jpg',
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    expect(syncWorker.isReadyForRetry(scanNew)).toBe(true);

    const scanRecentFail: OfflineScan = {
      id: 'scan-2',
      imageUri: 'file:///path/2.jpg',
      timestamp: Date.now(),
      status: 'failed',
      retryCount: 1,
      lastAttemptAt: Date.now(), // just attempted
    };

    expect(syncWorker.isReadyForRetry(scanRecentFail)).toBe(false);

    const scanOldFail: OfflineScan = {
      id: 'scan-3',
      imageUri: 'file:///path/3.jpg',
      timestamp: Date.now(),
      status: 'failed',
      retryCount: 1,
      lastAttemptAt: Date.now() - 10000, // attempted 10s ago (> 2s backoff)
    };

    expect(syncWorker.isReadyForRetry(scanOldFail)).toBe(true);

    const scanCancelled: OfflineScan = {
      id: 'scan-4',
      imageUri: 'file:///path/4.jpg',
      timestamp: Date.now(),
      status: 'cancelled',
    };

    expect(syncWorker.isReadyForRetry(scanCancelled)).toBe(false);
  });
});
