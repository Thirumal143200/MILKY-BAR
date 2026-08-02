import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
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
  }, [loadServerScans, queue]);

  const onRefresh = () => {
    setRefreshing(true);
    loadServerScans(true);
  };

  const getCombinedScans = () => {
    const pendingAndFailed = queue.filter(
      (item) => item.status === 'pending' || item.status === 'syncing' || item.status === 'failed',
    );

    const formattedPending = pendingAndFailed.map((item) => ({
      id: item.id,
      status: item.status,
      createdAt: item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString(),
      qualityLabel:
        (item.prediction as any)?.qualityClass || (item.prediction as any)?.qualityLabel || null,
      confidence:
        (item.prediction as any)?.confidenceScore || (item.prediction as any)?.confidence || null,
      imageUri: item.imageUri,
      isLocal: true,
    }));

    return [...formattedPending, ...serverScans];
  };

  const combinedScans = getCombinedScans();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'synced':
        return '#4ade80';
      case 'pending':
        return '#facc15';
      case 'syncing':
        return '#38bdf8';
      case 'failed':
        return '#f87171';
      default:
        return '#9ca3af';
    }
  };

  const getLabelColor = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'fresh':
      case 'normal':
        return {
          color: '#4ade80',
          borderColor: 'rgba(74, 222, 128, 0.3)',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
        };
      case 'spoiled':
      case 'mastitis':
        return {
          color: '#f87171',
          borderColor: 'rgba(248, 113, 113, 0.3)',
          backgroundColor: 'rgba(248, 113, 113, 0.1)',
        };
      case 'adulterated':
      case 'watered':
      case 'contaminated':
        return {
          color: '#fb923c',
          borderColor: 'rgba(251, 146, 60, 0.3)',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
        };
      default:
        return {
          color: '#9ca3af',
          borderColor: 'rgba(156, 163, 175, 0.3)',
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
        };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Bar Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerIcon}>🥛</Text>
          <Text style={styles.headerTitle}>MIRA</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync Manager Banner */}
      <View style={styles.syncBanner}>
        <UploadSyncManager />
      </View>

      {/* Activity Feed Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ScanHistory')}>
          <Text style={styles.seeAllText}>See All ›</Text>
        </TouchableOpacity>
      </View>

      {/* Scan History Feed */}
      <View style={styles.feedContainer}>
        {isLoading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Fetching Quality History...</Text>
          </View>
        ) : combinedScans.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyTitle}>No Scans Available</Text>
            <Text style={styles.emptySubtitle}>
              Tap the button below to start a new milk analysis.
            </Text>
          </View>
        ) : (
          <FlatList
            data={combinedScans}
            keyExtractor={(item, idx) => item.id || `scan-${idx}`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
            }
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => {
              const labelStyle = getLabelColor(item.qualityLabel);
              return (
                <TouchableOpacity
                  style={styles.scanCard}
                  onPress={() =>
                    item.isLocal
                      ? navigation.navigate('ScanDetails', { scanId: item.id, isLocal: true })
                      : navigation.navigate('ScanDetails', { scanId: item.id })
                  }
                  activeOpacity={0.8}
                >
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.scanImage} />
                  ) : (
                    <View style={styles.scanPlaceholder}>
                      <Text style={styles.scanPlaceholderIcon}>🥛</Text>
                    </View>
                  )}

                  <View style={styles.scanInfo}>
                    <Text style={styles.scanTime}>{new Date(item.createdAt).toLocaleString()}</Text>

                    <View style={styles.statusRow}>
                      <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                      </Text>
                      {item.isLocal && (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingText}>Pending Sync</Text>
                        </View>
                      )}
                    </View>

                    {item.qualityLabel ? (
                      <View style={styles.labelRow}>
                        <View style={[styles.qualityPill, labelStyle]}>
                          <Text style={[styles.qualityPillText, { color: labelStyle.color }]}>
                            {item.qualityLabel}
                          </Text>
                        </View>
                        {item.confidence && (
                          <Text style={styles.confidenceText}>
                            {(item.confidence * 100).toFixed(1)}%
                          </Text>
                        )}
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Floating Shutter Action Button */}
      <View style={styles.shutterContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Camera')}
          style={styles.shutterButton}
          activeOpacity={0.85}
        >
          <Text style={styles.shutterText}>📷 New Milk Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar Hub */}
      <View style={[styles.navHub, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity onPress={() => loadServerScans()} style={styles.navTab}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ScanHistory')} style={styles.navTab}>
          <Text style={styles.navIcon}>📁</Text>
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Reports')} style={styles.navTab}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.navTab}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIcon: {
    fontSize: 18,
  },
  syncBanner: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38bdf8',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerBox: {
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
    textAlign: 'center',
  },
  listPadding: {
    paddingBottom: 20,
  },
  scanCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  scanImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  scanPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  scanPlaceholderIcon: {
    fontSize: 24,
  },
  scanInfo: {
    flex: 1,
    marginLeft: 14,
  },
  scanTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pendingBadge: {
    marginLeft: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qualityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  qualityPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  confidenceText: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 8,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: '700',
  },
  shutterContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  shutterButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  shutterText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  navHub: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  navTab: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
  },
  navTextActive: {
    color: '#38bdf8',
  },
});
