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
  clearSyncedQueue: () => void;
}

// Simple base64 shift visual obfuscation to simulate local file path encryption
const encryptPath = (path: string): string => {
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
      addScan: (scan) => {
        const currentQueue = get().queue;
        // Duplicate detection guard
        if (currentQueue.some((item) => item.id === scan.id)) {
          return;
        }
        const secureScan = {
          ...scan,
          imageUri: encryptPath(scan.imageUri),
        };
        set((state) => ({ queue: [...state.queue, secureScan] }));
      },
      updateScanStatus: (id, status, prediction) =>
        set((state) => ({
          queue: state.queue.map((s) =>
            s.id === id ? { ...s, status, prediction: prediction || s.prediction } : s,
          ),
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
    }),
    {
      name: 'milkboy-offline-sync',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
