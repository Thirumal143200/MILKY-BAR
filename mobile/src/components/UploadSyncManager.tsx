import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useSyncStore } from '../store/sync.store';
import { apiCreateScan, apiUploadImage, apiAnalyzeScan } from '../api/client';

export function UploadSyncManager() {
  const getPendingScans = useSyncStore((state) => state.getPendingScans);
  const updateScanStatus = useSyncStore((state) => state.updateScanStatus);
  const isSyncing = useRef(false);

  useEffect(() => {
    // Attempt sync on app foreground or interval
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        attemptSync();
      }
    });

    const intervalId = setInterval(attemptSync, 15000); // Check every 15 seconds

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, []);

  const attemptSync = async () => {
    if (isSyncing.current) return;

    const pendingScans = getPendingScans();
    if (pendingScans.length === 0) return;

    isSyncing.current = true;

    for (const scan of pendingScans) {
      try {
        updateScanStatus(scan.id, 'syncing');

        // 1. Create a scan record on backend
        const createdScan = await apiCreateScan({ deviceId: 'mobile-app' });

        // 2. Upload the image
        await apiUploadImage(createdScan.data.id, scan.imageUri);

        // 3. Trigger analysis (this hits the python microservice via backend)
        const prediction = await apiAnalyzeScan(createdScan.data.id);

        // 4. Mark as synced and store prediction
        updateScanStatus(scan.id, 'synced', prediction.data);
      } catch (error) {
        console.error(`Failed to sync scan ${scan.id}:`, error);
        updateScanStatus(scan.id, 'failed');
      }
    }

    isSyncing.current = false;
  };

  return null; // Headless component
}
