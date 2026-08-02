import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { apiClient } from '../api/client';

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'producer' | 'consumer' | 'lab_staff'>('consumer');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert(
        'Required Fields Missing',
        'Please fill in First Name, Last Name, Email, and Password.',
      );
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim() || undefined,
        language: 'en',
      });

      Alert.alert(
        'Registration Successful',
        'Your account has been created. You can now sign in with your credentials.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: any) {
      const errorData = error.response?.data?.error || error.response?.data;
      let message = errorData?.message || 'Registration failed. Please try again.';
      if (errorData?.details) {
        const fieldErrors = Object.entries(errorData.details)
          .map(
            ([field, msgs]: [string, any]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`,
          )
          .join('\n');
        if (fieldErrors) message += `\n\n${fieldErrors}`;
      }
      Alert.alert('Registration Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.headerBox}>
            <Text style={styles.logoIcon}>🥛</Text>
            <Text style={styles.titleText}>Join MilkBoy</Text>
            <Text style={styles.subtitleText}>Create a new enterprise account</Text>
          </View>

          {/* Card Form */}
          <View style={styles.card}>
            {/* First & Last Name */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor="#9ca3af"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 6 }]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor="#9ca3af"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="john.doe@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Text style={styles.hintText}>
                Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special char.
              </Text>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+1234567890"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Role Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Role *</Text>
              <View style={styles.roleContainer}>
                {(['consumer', 'producer', 'lab_staff'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[styles.roleButton, role === r && styles.roleButtonActive]}
                  >
                    <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                      {r.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.signInContainer}
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 440,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 44,
    marginBottom: 6,
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
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    fontSize: 14,
  },
  hintText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'capitalize',
  },
  roleTextActive: {
    color: '#ffffff',
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
  signInContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signInText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  signInHighlight: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
