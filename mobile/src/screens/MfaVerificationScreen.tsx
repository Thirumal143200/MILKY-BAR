import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { apiClient } from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';

export default function MfaVerificationScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);

  // We expect user credentials details passed from login screen if MFA is required
  const { email, password } = route.params || {};

  const handleVerifyOtp = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      // In our login flow, if MFA is required, we can submit email, password, and the mfaCode directly
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        mfaCode: code,
      });

      const data = response.data.data || response.data;
      await setSession(data.accessToken, data.refreshToken, data.user);
      Alert.alert('Authenticated', 'Access granted.', [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error.response?.data?.message || 'Invalid verification code.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-center px-6">
      <View className="w-full max-w-sm self-center">
        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">
          MFA Verification
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
          Enter the 6-digit authentication code from your authenticator app to log in.
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Authentication Code
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-2xl font-bold tracking-widest"
              placeholder="000000"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
          </View>

          <TouchableOpacity
            onPress={handleVerifyOtp}
            disabled={isLoading}
            className={`w-full mt-4 bg-blue-600 py-4 rounded-xl items-center ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.replace('Login')} className="mt-6">
          <Text className="text-blue-600 dark:text-blue-400 text-center font-medium">Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
