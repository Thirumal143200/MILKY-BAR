import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
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
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications from your list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ],
    );
  };

  const filteredNotifications = notifications.filter((item) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q);
  });

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900 px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4 mt-2">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Text className="text-white text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Notifications</Text>
          {unreadCount > 0 && (
            <View className="bg-blue-500 rounded-full px-2 py-0.5 ml-2">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center space-x-3">
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} className="mr-2">
              <Text className="text-blue-400 font-semibold text-xs">Read All</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text className="text-red-400 font-semibold text-xs">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Input */}
      <View className="bg-gray-800 rounded-xl px-3 py-2 mb-3 flex-row items-center border border-gray-700">
        <Text className="mr-2 text-gray-400">🔍</Text>
        <TextInput
          placeholder="Search notifications..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
          className="flex-1 text-white text-sm"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text className="text-gray-400 text-xs">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <View className="mb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(cat) => cat.value}
          renderItem={({ item }) => {
            const isActive = activeCategory === item.value;
            return (
              <TouchableOpacity
                onPress={() => setActiveCategory(item.value)}
                className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                  isActive ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-700'
                }`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Notification List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-gray-500 text-4xl mb-2">🔔</Text>
          <Text className="text-gray-400 text-base font-semibold">No notifications found</Text>
          <Text className="text-gray-600 text-xs mt-1 text-center">
            {searchText
              ? 'Try adjusting your search criteria'
              : 'System updates and alerts will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                if (!item.read) markAsRead(item.id);
                navigation.navigate('NotificationDetails', { alert: item });
              }}
              className={`p-4 rounded-2xl mb-3 border flex-row items-start ${
                item.read
                  ? 'bg-gray-800/20 border-gray-800/50 opacity-60'
                  : 'bg-gray-800/60 border-blue-500/20'
              }`}
            >
              <View className="w-10 h-10 bg-gray-800 rounded-full justify-center items-center mr-3 border border-gray-700">
                <Text className="text-lg">{getIcon(item.category || item.type)}</Text>
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <Text className="text-white font-extrabold text-base flex-1 pr-2">
                    {item.title}
                  </Text>
                  {!item.read && <View className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1" />}
                </View>

                <Text className="text-gray-300 text-sm mt-1 leading-relaxed">{item.message}</Text>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-gray-500 text-[10px] font-bold uppercase">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                    {item.category || 'SYSTEM'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
