import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { apiClient } from '../api/client';

export default function ResetPasswordScreen({ navigation }: { navigation: any }) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!token || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, password });
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please login with your new credentials.',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }],
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-center px-6">
      <View className="w-full max-w-sm self-center">
        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">
          Reset Password
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
          Enter the reset token sent to your email and your new password.
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Reset Token / OTP
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700"
              placeholder="Enter Reset Token"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              value={token}
              onChangeText={setToken}
            />
          </View>

          <View className="mt-4">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={isLoading}
            className={`w-full mt-4 bg-blue-600 py-4 rounded-xl items-center ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-6">
          <Text className="text-blue-600 dark:text-blue-400 text-center font-medium">
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
