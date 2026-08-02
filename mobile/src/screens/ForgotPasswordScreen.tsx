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

export default function ForgotPasswordScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim() });
      Alert.alert(
        'Success',
        'If the email matches a registered account, password reset instructions have been dispatched.',
        [{ text: 'OK', onPress: () => navigation.navigate('ResetPassword') }],
      );
    } catch (error: any) {
      const errorData = error.response?.data?.error || error.response?.data;
      const message = errorData?.message || 'Failed to submit password reset request.';
      Alert.alert('Request Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} className="flex-1 bg-gray-900 justify-center px-6">
      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.headerBox}>
          <Text style={styles.iconText}>🔑</Text>
          <Text style={styles.titleText}>Forgot Password</Text>
          <Text style={styles.subtitleText}>
            Enter your account email address to receive reset instructions.
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRequestReset}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Instructions</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Navigation Link */}
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
