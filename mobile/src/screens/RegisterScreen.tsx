import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
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
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role,
        phone: phone || undefined,
        language: 'en',
      });

      Alert.alert('Registration Successful', 'You can now sign in with your credentials.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Registration failed. Please check password criteria (8+ chars, upper, lower, number, symbol).';
      Alert.alert('Registration Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-gray-50 dark:bg-gray-900 px-6 py-12"
    >
      <View className="w-full max-w-sm mx-auto justify-center flex-1">
        <Text className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">
          Join MilkBoy
        </Text>
        <Text className="text-lg text-gray-500 text-center mb-6">Create a new account</Text>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-4 border border-gray-100 dark:border-gray-700">
          <View className="flex-row space-x-2">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
                placeholder="John"
                placeholderTextColor="#9ca3af"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600"
                placeholder="Doe"
                placeholderTextColor="#9ca3af"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600"
              placeholder="john.doe@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Password *
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Text className="text-xs text-gray-400 mt-1">
              Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char.
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Phone Number (Optional)
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600"
              placeholder="+1234567890"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Role
            </Text>
            <View className="flex-row space-x-2">
              {(['consumer', 'producer', 'lab_staff'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  className={`flex-1 py-2 rounded-xl border items-center ${
                    role === r
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-transparent border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Text
                    className={`font-semibold text-xs capitalize ${
                      role === r ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className={`mt-4 bg-blue-600 py-3.5 rounded-xl flex-row justify-center items-center ${
              isLoading ? 'opacity-70' : ''
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="mt-6 align-center"
        >
          <Text className="text-blue-600 text-center font-medium">
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
