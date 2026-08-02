import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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

      // Save tokens and user metadata
      if (response.data?.accessToken) {
        await AsyncStorage.setItem('jwt_token', response.data.accessToken);
      }
      if (response.data?.refreshToken) {
        await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
      }
      if (response.data?.user?.role) {
        await AsyncStorage.setItem('user_role', response.data.user.role);
      }

      navigation.replace('Home');
    } catch (error: any) {
      const errorData = error.response?.data?.error || error.response?.data;
      const message = errorData?.message || 'Invalid email or password.';
      Alert.alert('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      className="flex-1 bg-gray-900 justify-center items-center px-6"
    >
      <View style={styles.cardContainer} className="w-full max-w-sm">
        {/* Brand Header */}
        <View style={styles.headerBox}>
          <Text style={styles.logoIcon}>🥛</Text>
          <Text style={styles.titleText} className="text-4xl font-extrabold text-white text-center">
            MIRA
          </Text>
          <Text style={styles.subtitleText} className="text-gray-400 text-center">
            Enterprise Milk Quality Verification
          </Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.card} className="bg-gray-800 rounded-3xl p-6 border border-gray-700">
          <View style={styles.inputGroup}>
            <Text style={styles.label} className="text-sm font-semibold text-gray-300 mb-1">
              Email Address
            </Text>
            <TextInput
              style={styles.input}
              className="bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600"
              placeholder="producer@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label} className="text-sm font-semibold text-gray-300 mb-1">
              Password
            </Text>
            <TextInput
              style={styles.input}
              className="bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
            className="mt-6 bg-blue-600 py-4 rounded-xl flex-row justify-center items-center"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText} className="text-white font-bold text-lg">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Navigation Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Registration Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.signUpContainer}
        >
          <Text style={styles.signUpText}>
            Don't have an account? <Text style={styles.signUpHighlight}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    marginTop: 12,
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
  linksContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '500',
  },
  signUpContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  signUpText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  signUpHighlight: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
