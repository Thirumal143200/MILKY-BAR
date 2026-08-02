import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiListScans } from '../api/client';
import { OfflineSyncBanner } from '../components/OfflineSyncBanner';

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
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setScans(data);
      }
    } catch (e) {
      console.warn('Failed to load scan history', e);
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
        !filterStatus || scan.status?.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  };

  const filteredScans = getFilteredScans();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <OfflineSyncBanner />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan History</Text>
        <TouchableOpacity onPress={() => loadScans()} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by title, quality, notes..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { label: 'All', value: null },
          { label: 'Completed', value: 'completed' },
          { label: 'Pending', value: 'pending' },
          { label: 'Failed', value: 'failed' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.label}
            onPress={() => setFilterStatus(tab.value)}
            style={[styles.filterTab, filterStatus === tab.value && styles.filterTabActive]}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === tab.value && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scan List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Loading Scan Archives...</Text>
        </View>
      ) : filteredScans.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No Scans Found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search query or filter criteria.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredScans}
          keyExtractor={(item, index) => item.id || `hist-${index}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
          }
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ScanDetails', { scanId: item.id })}
              style={styles.card}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {item.title || `Milk Scan #${item.id.slice(0, 8)}`}
                </Text>
                <Text style={styles.cardStatus}>{item.status?.toUpperCase() || 'COMPLETED'}</Text>
              </View>

              <Text style={styles.cardDate}>
                {new Date(item.createdAt || item.timestamp || Date.now()).toLocaleString()}
              </Text>

              {item.qualityLabel && (
                <View style={styles.qualityPill}>
                  <Text style={styles.qualityText}>Assessment: {item.qualityLabel}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  refreshBtn: {
    paddingVertical: 4,
  },
  refreshIcon: {
    fontSize: 18,
  },
  searchBox: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cardStatus: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  cardDate: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 8,
  },
  qualityPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  qualityText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
});
