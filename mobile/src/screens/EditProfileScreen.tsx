import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function EditProfileScreen({ navigation }: { navigation: any }) {
  const user = useAuthStore((state) => state.user);
  const loadSession = useAuthStore((state) => state.loadSession);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'First name and last name are required.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.put('/users/profile', { firstName, lastName });
      await loadSession(); // Refresh profile state in store
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</Text>
        <TouchableOpacity onPress={handleUpdate} disabled={isLoading}>
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-lg">Save</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <View className="p-6 space-y-4">
        <View>
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            First Name
          </Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700"
            placeholder="Jane"
            placeholderTextColor="#9ca3af"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View className="mt-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Last Name
          </Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700"
            placeholder="Doe"
            placeholderTextColor="#9ca3af"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
