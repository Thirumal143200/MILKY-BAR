import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNotificationStore } from '../store/notificationStore';

export default function NotificationDetailsScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { alert } = route.params || {};
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  useEffect(() => {
    if (alert?.id && !alert.read) {
      markAsRead(alert.id);
    }
  }, [alert]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-lg">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Alert Details</Text>
      </View>

      {/* Content */}
      <View className="p-6 justify-between flex-1">
        <View className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Text className="text-xs text-gray-400 mb-2 font-semibold uppercase">
            {alert?.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Just now'}
          </Text>
          <Text className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
            {alert?.title || 'System Notification'}
          </Text>
          <Text className="text-base text-gray-700 dark:text-gray-300 leading-6">
            {alert?.message || 'No description details provided.'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-full bg-blue-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">Acknowledge Alert</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
