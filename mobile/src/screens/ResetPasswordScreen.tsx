import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { apiClient } from '../api/client';

export default function ResetPasswordScreen({ navigation }: { navigation: any }) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!token.trim() || !password) {
      Alert.alert('Error', 'Please fill in both the token and your new password.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token: token.trim(),
        newPassword: password,
      });

      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please login with your new credentials.',
        [{ text: 'Sign In', onPress: () => navigation.replace('Login') }],
      );
    } catch (error: any) {
      const errorData = error.response?.data?.error || error.response?.data;
      let message = errorData?.message || 'Failed to reset password.';
      if (errorData?.details) {
        const fieldErrors = Object.entries(errorData.details)
          .map(
            ([field, msgs]: [string, any]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`,
          )
          .join('\n');
        if (fieldErrors) message += `\n\n${fieldErrors}`;
      }
      Alert.alert('Reset Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-gray-900 justify-center px-6">
      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.headerBox}>
          <Text style={styles.iconText}>🔐</Text>
          <Text style={styles.titleText}>Reset Password</Text>
          <Text style={styles.subtitleText}>
            Enter the reset token sent to your email and your new password.
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reset Token / OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Reset Token"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              value={token}
              onChangeText={setToken}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Back Link */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backContainer}>
          <Text style={styles.backText}>‹ Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconText: {
    fontSize: 44,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    fontSize: 15,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  backContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
  },
});
