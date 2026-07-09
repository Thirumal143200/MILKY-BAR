import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSyncStore } from '../store/sync.store';
import { UploadSyncManager } from '../components/UploadSyncManager';
import { apiListScans } from '../api/client';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const queue = useSyncStore((state) => state.queue);
  const [serverScans, setServerScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadServerScans = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await apiListScans();
      // Ensure we extract the data array
      if (res && res.data) {
        setServerScans(res.data);
      } else if (Array.isArray(res)) {
        setServerScans(res);
      }
    } catch (error) {
      console.warn('Failed to load server scans:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadServerScans();
  }, [loadServerScans, queue]); // Reload when queue changes (meaning sync completed)

  const onRefresh = () => {
    setRefreshing(true);
    loadServerScans(true);
  };

  // Combine queue (local pending) and server scans
  // If scan is local but status is synced, check if it's already in serverScans
  const getCombinedScans = () => {
    const pendingAndFailed = queue.filter(
      (item) => item.status === 'pending' || item.status === 'syncing' || item.status === 'failed',
    );

    // Map pending scans to common format
    const formattedPending = pendingAndFailed.map((item) => ({
      id: item.id,
      status: item.status,
      createdAt: new Date(item.timestamp).toISOString(),
      qualityLabel: (item.prediction as any)?.qualityLabel || null,
      confidence: (item.prediction as any)?.confidence || null,
      isLocal: true,
      imageUri: item.imageUri,
    }));

    return [...formattedPending, ...serverScans];
  };

  const combinedScans = getCombinedScans();

  // Statistics calculation
  const totalScans = combinedScans.length;
  const freshCount = combinedScans.filter(
    (s) => s.qualityLabel === 'excellent' || s.qualityLabel === 'good',
  ).length;
  const spoiledCount = combinedScans.filter(
    (s) => s.qualityLabel === 'spoiled' || s.qualityLabel === 'adulterated',
  ).length;

  const getLabelColor = (label: string) => {
    if (!label) return 'text-gray-500';
    switch (label.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'acceptable':
      case 'poor':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'adulterated':
      case 'spoiled':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
      case 'completed':
        return 'text-green-500';
      case 'syncing':
      case 'analyzing':
        return 'text-blue-500';
      case 'failed':
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900">
      <UploadSyncManager />

      {/* Top Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-800">
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          className="w-10 h-10 bg-gray-800 rounded-full justify-center items-center border border-gray-700"
        >
          <Text className="text-white text-base font-bold">👤</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-2xl font-extrabold text-white tracking-tight">MilkBoy</Text>
          <Text className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
            Quality Portal
          </Text>
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            className="w-10 h-10 bg-gray-800 rounded-full justify-center items-center border border-gray-700 relative"
          >
            <Text className="text-white text-base">🔔</Text>
            <View className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-900" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics Cards */}
      <View className="px-4 py-4 flex-row space-x-2">
        <View className="flex-1 bg-gray-800/40 border border-gray-800 p-3 rounded-2xl">
          <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Total Scans</Text>
          <Text className="text-white text-2xl font-black">{totalScans}</Text>
        </View>
        <View className="flex-1 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl">
          <Text className="text-emerald-400 text-xs font-bold uppercase mb-1">Fresh/Good</Text>
          <Text className="text-emerald-500 text-2xl font-black">{freshCount}</Text>
        </View>
        <View className="flex-1 bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl">
          <Text className="text-rose-400 text-xs font-bold uppercase mb-1">Spoiled Alerts</Text>
          <Text className="text-rose-500 text-2xl font-black">{spoiledCount}</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 px-4 py-2">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-extrabold text-white">Recent Quality Scans</Text>
          {isLoading && <ActivityIndicator size="small" color="#3b82f6" />}
        </View>

        {combinedScans.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-4xl mb-4">🥛</Text>
            <Text className="text-gray-400 font-semibold text-lg text-center mb-1">
              No Scans Recorded Yet
            </Text>
            <Text className="text-gray-500 text-sm text-center px-8">
              Tap "New Scan" below to capture a milk sample and run an instant AI quality analysis.
            </Text>
          </View>
        ) : (
          <FlatList
            data={combinedScans}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  item.status === 'completed' || item.status === 'synced'
                    ? navigation.navigate('Result', {
                        scanId: item.id,
                        prediction: {
                          qualityLabel: item.qualityLabel,
                          confidence: item.confidence,
                          explanation:
                            item.notes || 'Heuristic quality test successfully performed.',
                        },
                      })
                    : null
                }
                className="flex-row bg-gray-800/40 border border-gray-800/80 p-4 mb-3 rounded-2xl items-center"
              >
                {/* Image Preview / Icon Placeholder */}
                {item.imageUri ? (
                  <Image
                    source={{ uri: item.imageUri }}
                    className="w-16 h-16 rounded-xl bg-gray-800 border border-gray-700"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-xl bg-blue-600/10 border border-blue-500/20 justify-center items-center">
                    <Text className="text-2xl">🥛</Text>
                  </View>
                )}

                <View className="ml-4 flex-1">
                  <Text className="font-extrabold text-white text-base">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text
                      className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                    {item.isLocal && (
                      <View className="ml-2 bg-blue-600/20 px-1.5 py-0.5 rounded border border-blue-500/20">
                        <Text className="text-[10px] text-blue-400 font-bold uppercase">
                          Pending Sync
                        </Text>
                      </View>
                    )}
                  </View>

                  {item.qualityLabel ? (
                    <View className="flex-row items-center mt-2">
                      <View
                        className={`px-2 py-0.5 rounded-full border ${getLabelColor(item.qualityLabel)}`}
                      >
                        <Text className="text-[10px] font-extrabold uppercase tracking-wide">
                          {item.qualityLabel}
                        </Text>
                      </View>
                      {item.confidence && (
                        <Text className="text-xs text-gray-400 ml-2 font-bold">
                          {(item.confidence * 100).toFixed(1)}%
                        </Text>
                      )}
                    </View>
                  ) : null}
                </View>

                {(item.status === 'completed' || item.status === 'synced') && (
                  <Text className="text-gray-500 text-lg font-bold">›</Text>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Floating Shutter Button */}
      <View className="items-center pb-6">
        <TouchableOpacity
          onPress={() => navigation.navigate('Camera')}
          className="bg-blue-600 px-8 py-4 rounded-full flex-row items-center space-x-2 shadow-lg shadow-blue-500/30"
        >
          <Text className="text-white text-lg font-bold tracking-wide">📷 New Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Bottom Tab Bar Hub */}
      <View className="flex-row bg-gray-950/80 border-t border-gray-900 justify-around py-3">
        <TouchableOpacity onPress={() => loadServerScans()} className="items-center">
          <Text className="text-lg">🏠</Text>
          <Text className="text-[10px] text-blue-500 font-bold mt-0.5">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('ScanHistory')}
          className="items-center"
        >
          <Text className="text-lg">📁</Text>
          <Text className="text-[10px] text-gray-400 font-bold mt-0.5">History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Reports')} className="items-center">
          <Text className="text-lg">📊</Text>
          <Text className="text-[10px] text-gray-400 font-bold mt-0.5">Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="items-center">
          <Text className="text-lg">⚙️</Text>
          <Text className="text-[10px] text-gray-400 font-bold mt-0.5">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
