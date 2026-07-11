import { create } from 'zustand';
import { apiClient } from '../api/client.js';

export type Scan = {
  id: string;
  title: string;
  notes?: string;
  status: string;
  createdAt: string;
};

interface ScanState {
  scans: Scan[];
  activeScanId: string | null;
  activeImages: string[];
  isLoading: boolean;
  error: string | null;
  fetchScans: () => Promise<void>;
  createScan: (title: string, notes?: string) => Promise<string>;
  uploadImage: (imageUri: string) => Promise<void>;
  analyzeScan: () => Promise<any>;
  resetActiveScan: () => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  scans: [],
  activeScanId: null,
  activeImages: [],
  isLoading: false,
  error: null,
  fetchScans: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/scans');
      set({ scans: res.data.data || res.data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },
  createScan: async (title, notes) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/scans', { title, notes });
      const scanId = res.data.id || res.data.data.id;
      set({ activeScanId: scanId, activeImages: [], error: null });
      return scanId;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  uploadImage: async (imageUri) => {
    const { activeScanId } = get();
    if (!activeScanId) throw new Error('No active scan.');
    set({ isLoading: true });
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'scan.jpg';
      const type = `image/${filename.split('.').pop() || 'jpeg'}`;
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      await apiClient.post(`/scans/${activeScanId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      set((state) => ({
        activeImages: [...state.activeImages, imageUri],
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  analyzeScan: async () => {
    const { activeScanId } = get();
    if (!activeScanId) throw new Error('No active scan.');
    set({ isLoading: true });
    try {
      const res = await apiClient.post(`/scans/${activeScanId}/analyze`);
      return res.data.data || res.data;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  resetActiveScan: () => {
    set({ activeScanId: null, activeImages: [] });
  },
}));
