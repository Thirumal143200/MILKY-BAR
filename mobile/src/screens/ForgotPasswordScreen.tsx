import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { apiClient } from '../api/client';

export default function ForgotPasswordScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      Alert.alert(
        'Success',
        'If the email matches a registered account, you will receive a reset link/OTP shortly.',
        [{ text: 'OK', onPress: () => navigation.navigate('ResetPassword') }],
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-center px-6">
      <View className="w-full max-w-sm self-center">
        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">
          Forgot Password
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
          Enter your email address to receive password reset details.
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700"
              placeholder="user@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity
            onPress={handleRequestReset}
            disabled={isLoading}
            className={`w-full mt-4 bg-blue-600 py-4 rounded-xl items-center ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Submitting...' : 'Send Reset Instructions'}
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
