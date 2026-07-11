import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiListScans } from '../api/client';

export default function ScanHistoryScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const loadScans = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiListScans();
      if (res && res.data) {
        setScans(res.data);
      } else if (Array.isArray(res)) {
        setScans(res);
      }
    } catch (e) {
      console.error('Failed to load scan history', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const onRefresh = () => {
    setRefreshing(true);
    loadScans(true);
  };

  const getFilteredScans = () => {
    return scans.filter((scan) => {
      const matchesSearch =
        !search ||
        (scan.title && scan.title.toLowerCase().includes(search.toLowerCase())) ||
        (scan.notes && scan.notes.toLowerCase().includes(search.toLowerCase())) ||
        (scan.qualityLabel && scan.qualityLabel.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        !filterStatus || scan.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  };

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

  const filteredScans = getFilteredScans();

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900 px-4">
      {/* Header */}
      <View className="flex-row items-center mb-6 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">Scan History</Text>
      </View>

      {/* Search Input */}
      <View className="mb-4">
        <TextInput
          className="bg-gray-800 text-white px-4 py-3 rounded-2xl border border-gray-700"
          placeholder="Search scans (e.g. Excellent, Spoiled...)"
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View className="flex-row space-x-2 mb-6">
        <TouchableOpacity
          onPress={() => setFilterStatus(null)}
          className={`px-4 py-2 rounded-xl border ${
            filterStatus === null ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-700'
          }`}
        >
          <Text className="text-white font-semibold text-xs">All</Text>
        </TouchableOpacity>

        {['completed', 'failed'].map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl border capitalize ${
              filterStatus === status
                ? 'bg-blue-600 border-blue-600'
                : 'bg-transparent border-gray-700'
            }`}
          >
            <Text className="text-white font-semibold text-xs">{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredScans.length === 0 ? (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-4xl mb-4">📂</Text>
          <Text className="text-gray-400 font-semibold text-lg text-center">No scans found</Text>
          <Text className="text-gray-500 text-sm text-center mt-1">
            Try adjusting your search criteria or swipe down to refresh.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredScans}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ScanDetails', { scanId: item.id })}
              className="bg-gray-800/40 border border-gray-800 p-4 mb-3 rounded-2xl flex-row justify-between items-center"
            >
              <View className="flex-1">
                <Text className="text-white font-extrabold text-base">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>

                <Text className="text-gray-500 text-xs font-bold uppercase mt-1">
                  Status: {item.status}
                </Text>

                {item.qualityLabel ? (
                  <View className="flex-row items-center mt-2">
                    <View
                      className={`px-2.5 py-0.5 rounded-full border ${getLabelColor(item.qualityLabel)}`}
                    >
                      <Text className="text-[10px] font-extrabold uppercase tracking-wide">
                        {item.qualityLabel}
                      </Text>
                    </View>
                    {item.confidence && (
                      <Text className="text-xs text-gray-400 font-bold ml-2">
                        {(item.confidence * 100).toFixed(1)}%
                      </Text>
                    )}
                  </View>
                ) : null}
              </View>

              <Text className="text-gray-500 text-xl font-bold">›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
