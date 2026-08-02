import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://milkboy-server.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const apiUploadImage = async (scanId: string, imageUri: string) => {
  const formData = new FormData();

  // Format the URI for React Native FormData
  const filename = imageUri.split('/').pop() || 'scan.jpg';
  const type = `image/${filename.split('.').pop() || 'jpeg'}`;

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as unknown as Blob);

  const response = await apiClient.post(`/scans/${scanId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const apiAnalyzeScan = async (scanId: string) => {
  const response = await apiClient.post(`/scans/${scanId}/analyze`);
  return response.data;
};

export const apiCreateScan = async (data: { deviceId: string; location?: string }) => {
  const response = await apiClient.post('/scans', data);
  return response.data;
};

export const apiListScans = async () => {
  const response = await apiClient.get('/scans');
  return response.data;
};
