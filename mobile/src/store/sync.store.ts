import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OfflineScan = {
  id: string;
  imageUri: string;
  timestamp: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  prediction?: unknown;
};

interface SyncState {
  queue: OfflineScan[];
  addScan: (scan: OfflineScan) => void;
  updateScanStatus: (id: string, status: OfflineScan['status'], prediction?: unknown) => void;
  removeScan: (id: string) => void;
  getPendingScans: () => OfflineScan[];
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      addScan: (scan) => set((state) => ({ queue: [...state.queue, scan] })),
      updateScanStatus: (id, status, prediction) =>
        set((state) => ({
          queue: state.queue.map((s) =>
            s.id === id ? { ...s, status, prediction: prediction || s.prediction } : s,
          ),
        })),
      removeScan: (id) => set((state) => ({ queue: state.queue.filter((s) => s.id !== id) })),
      getPendingScans: () =>
        get().queue.filter((s) => s.status === 'pending' || s.status === 'failed'),
    }),
    {
      name: 'milkboy-offline-sync',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
