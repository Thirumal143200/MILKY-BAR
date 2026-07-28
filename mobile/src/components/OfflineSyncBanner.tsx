/**
 * @module mobile/components/OfflineSyncBanner
 * UI banner component for network status & offline queue management.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { networkService, type NetworkState } from '../services/network.service';
import { useSyncStore } from '../store/sync.store';
import { syncWorker } from '../services/syncWorker';

export const OfflineSyncBanner: React.FC = () => {
  const [netState, setNetState] = useState<NetworkState>(networkService.getNetworkState());
  const { queue, isSyncing, isPaused, pauseSync, resumeSync, clearFailedQueue } = useSyncStore();

  useEffect(() => {
    const unsubscribe = networkService.subscribe((state) => {
      setNetState(state);
    });
    return () => unsubscribe();
  }, []);

  const pendingCount = queue.filter(
    (item) => item.status === 'pending' || item.status === 'failed',
  ).length;
  const failedCount = queue.filter((item) => item.status === 'failed').length;

  if (netState.isConnected && pendingCount === 0) {
    return null; // Clean UI state when online and queue is empty
  }

  const handleManualSync = () => {
    syncWorker.triggerSync().catch(() => {});
  };

  return (
    <View
      style={[
        styles.container,
        !netState.isConnected ? styles.bgOffline : isSyncing ? styles.bgSyncing : styles.bgQueued,
      ]}
    >
      <View style={styles.statusRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {!netState.isConnected
              ? '⚡ Operating Offline'
              : isSyncing
                ? '🔄 Syncing Queue...'
                : '📦 Offline Queue Pending'}
          </Text>
          <Text style={styles.subtitle}>
            {!netState.isConnected
              ? `${pendingCount} scan(s) queued locally.`
              : isSyncing
                ? `Synchronizing ${pendingCount} item(s) to server...`
                : `${pendingCount} scan(s) waiting (${failedCount} failed retry).`}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              {netState.isConnected && (
                <TouchableOpacity style={styles.btnPrimary} onPress={handleManualSync}>
                  <Text style={styles.btnText}>Sync Now</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={isPaused ? resumeSync : pauseSync}
              >
                <Text style={styles.btnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
              </TouchableOpacity>

              {failedCount > 0 && (
                <TouchableOpacity style={styles.btnDanger} onPress={clearFailedQueue}>
                  <Text style={styles.btnText}>Clear Failed</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  bgOffline: {
    backgroundColor: '#D97706', // Amber-600
  },
  bgSyncing: {
    backgroundColor: '#2563EB', // Blue-600
  },
  bgQueued: {
    backgroundColor: '#4F46E5', // Indigo-600
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  btnDanger: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  btnText: {
    color: '#1F2937',
    fontSize: 11,
    fontWeight: '600',
  },
});
