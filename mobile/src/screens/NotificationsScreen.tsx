import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../api/client';

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/notifications');
      if (res.data?.data) {
        setNotifications(res.data.data);
      } else if (Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      Alert.alert('Success', 'All notifications marked as read.');
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'scan_completed':
        return '🥛';
      case 'alert':
        return '⚠️';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900 px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6 mt-2">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Text className="text-white text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">Notifications</Text>
        </View>

        {notifications.some((n) => !n.read) && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text className="text-blue-400 font-semibold text-sm">Read All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 text-lg">No notifications found.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationDetails', { alert: item })}
              className={`p-4 rounded-2xl mb-3 border flex-row items-start ${
                item.read
                  ? 'bg-gray-800/20 border-gray-800/50 opacity-60'
                  : 'bg-gray-800/60 border-blue-500/20'
              }`}
            >
              <View className="w-10 h-10 bg-gray-800 rounded-full justify-center items-center mr-3 border border-gray-700">
                <Text className="text-lg">{getIcon(item.type)}</Text>
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <Text className="text-white font-extrabold text-base flex-1 pr-2">
                    {item.title}
                  </Text>
                  {!item.read && <View className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1" />}
                </View>

                <Text className="text-gray-300 text-sm mt-1 leading-relaxed">{item.message}</Text>

                <Text className="text-gray-500 text-[10px] font-bold mt-2 uppercase">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
