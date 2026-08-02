import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationStore } from '../store/notificationStore';
import type { NotificationCategory } from '@milkboy/shared';

const CATEGORIES: { label: string; value: NotificationCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Scans', value: 'scan' },
  { label: 'Reports', value: 'report' },
  { label: 'Sync', value: 'sync' },
  { label: 'Lab', value: 'laboratory' },
  { label: 'Auth', value: 'auth' },
  { label: 'Admin', value: 'admin' },
];

export default function NotificationsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    unreadCount,
    isLoading,
    activeCategory,
    setActiveCategory,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationStore();

  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'scan':
        return '🥛';
      case 'report':
        return '📄';
      case 'sync':
        return '🔄';
      case 'laboratory':
        return '🔬';
      case 'auth':
        return '🔐';
      case 'admin':
        return '🛡️';
      default:
        return '📢';
    }
  };

  const handleClearAll = () => {
    Alert.alert('Clear Notifications', 'Are you sure you want to delete all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearAll },
    ]);
  };

  const filtered = notifications.filter((n) => {
    if (activeCategory !== 'all' && n.category !== activeCategory) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn}>
            <Text style={styles.actionText}>Read All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notifications..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Categories Filter Tabs */}
      <View style={styles.categoriesBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(item.value)}
              style={[
                styles.categoryTab,
                activeCategory === item.value && styles.categoryTabActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === item.value && styles.categoryTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Notifications List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Loading Notifications...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No Notifications Found</Text>
          <Text style={styles.emptySubtitle}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationCard, !item.read && styles.unreadCard]}
              onPress={() => {
                markAsRead(item.id);
                navigation.navigate('NotificationDetails', { notification: item });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.notificationIcon}>{getIcon(item.category)}</Text>

              <View style={styles.notificationBody}>
                <View style={styles.notificationHeaderRow}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Footer Controls */}
      {notifications.length > 0 && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear All Notifications</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingVertical: 4,
  },
  actionText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBox: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
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
  categoriesBar: {
    paddingLeft: 20,
    paddingVertical: 8,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'flex-start',
  },
  unreadCard: {
    borderColor: '#38bdf8',
    backgroundColor: '#0f172a',
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationBody: {
    flex: 1,
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
  },
  notificationMessage: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    color: '#64748b',
    fontSize: 11,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  clearBtn: {
    paddingVertical: 8,
  },
  clearBtnText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
});
