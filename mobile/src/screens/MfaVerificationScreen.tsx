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
import { useAuthStore } from '../store/authStore';

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

  const { email, password } = route.params || {};

  const handleVerifyOtp = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the 6-digit authentication code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        mfaCode: code.trim(),
      });

      const data = response.data.data || response.data;
      await setSession(data.accessToken, data.refreshToken, data.user);
      Alert.alert('Authenticated', 'Access granted.', [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);
    } catch (error: any) {
      const errorData = error.response?.data?.error || error.response?.data;
      const message = errorData?.message || 'Invalid verification code.';
      Alert.alert('Verification Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-gray-900 justify-center px-6">
      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.headerBox}>
          <Text style={styles.iconText}>🛡️</Text>
          <Text style={styles.titleText}>MFA Verification</Text>
          <Text style={styles.subtitleText}>
            Enter the 6-digit code from your authenticator app to complete sign in.
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Authentication Code</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="000000"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyOtp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Verify & Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Back Link */}
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.backContainer}>
          <Text style={styles.backText}>Cancel</Text>
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
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
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
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
});
