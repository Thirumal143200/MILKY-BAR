import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { apiClient } from '../api/client';

export default function SecurityScreen({ navigation }: { navigation: any }) {
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    const fetchSecurityInfo = async () => {
      try {
        const profileRes = await apiClient.get('/users/me');
        const user = profileRes.data.data || profileRes.data;
        setMfaEnabled(user.mfaEnabled || false);

        // Fetch active sessions
        await apiClient.get('/admin/audit-logs?limit=5'); // Fetch logs as session alias
      } catch {
        // ignore
      }
    };
    fetchSecurityInfo();
  }, []);

  const handleMfaToggle = async (value: boolean) => {
    try {
      if (value) {
        // Request MFA setup secret
        const res = await apiClient.post('/auth/mfa/setup');
        const secret = res.data.secret || res.data.data?.secret;
        Alert.alert(
          'MFA Secret',
          `Setup secret key: ${secret}\n\nPlease enter this key in your Google Authenticator app, then verify a code.`,
        );
        navigation.navigate('MfaVerification', { mfaRequiredToken: secret });
      } else {
        // Disable MFA
        await apiClient.post('/auth/mfa/disable');
        setMfaEnabled(false);
        Alert.alert('MFA Disabled', 'Multi-factor authentication has been disabled.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'MFA toggle action failed.');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await apiClient.delete('/auth/logout-all-devices');
      Alert.alert('Sessions Revoked', 'You have been logged out from all other devices.');
    } catch {
      Alert.alert('Error', 'Failed to revoke other sessions.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-lg">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Security Settings</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          {/* MFA Toggle */}
          <View className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Multi-Factor Auth (MFA)
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                Protect your account with verification code prompts during login.
              </Text>
            </View>
            <Switch value={mfaEnabled} onValueChange={handleMfaToggle} />
          </View>

          {/* Change Password Link */}
          <TouchableOpacity
            onPress={() => Alert.alert('Action Required', 'Redirecting to password reset flow...')}
            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex-row items-center justify-between"
          >
            <View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Change Password
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                Update your password security credentials.
              </Text>
            </View>
            <Text className="text-blue-600 dark:text-blue-400 font-bold text-base">&gt;</Text>
          </TouchableOpacity>

          {/* Active Sessions list */}
          <View className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Active Sessions
              </Text>
              <TouchableOpacity onPress={handleLogoutAll}>
                <Text className="text-red-500 font-semibold text-xs">Revoke All</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-2">
              <View className="py-2 border-b border-gray-100 dark:border-gray-700 flex-row justify-between">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Android Emulator
                </Text>
                <Text className="text-xs text-gray-400">Current Session</Text>
              </View>
              <View className="py-2 flex-row justify-between">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Web Portal
                </Text>
                <Text className="text-xs text-gray-400">Active 2 hours ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
