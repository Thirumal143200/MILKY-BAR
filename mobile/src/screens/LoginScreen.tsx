import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });

      // Save tokens
      await AsyncStorage.setItem('jwt_token', response.data.accessToken);
      await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
      await AsyncStorage.setItem('user_role', response.data.user.role);

      navigation.replace('Home');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <View className="w-full max-w-sm">
        <Text className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">
          MilkBoy
        </Text>
        <Text className="text-lg text-gray-500 text-center mb-8">Sign in to your account</Text>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-4 border border-gray-100 dark:border-gray-700">
          <View>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600"
              placeholder="producer@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="mt-4">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Password
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`mt-6 bg-blue-600 py-4 rounded-xl flex-row justify-center items-center ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-6">
          <Text className="text-blue-600 text-center font-medium">
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
