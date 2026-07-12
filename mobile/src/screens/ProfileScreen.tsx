import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../api/client';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

interface UserSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActiveAt: string;
}

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profileRes = await apiClient.get('/users/me');
      const sessionsRes = await apiClient.get('/users/me/sessions');

      if (profileRes.data?.data) {
        const u = profileRes.data.data;
        setProfile(u);
        setFirstName(u.firstName);
        setLastName(u.lastName);
        setPhone(u.phone || '');
      } else if (profileRes.data) {
        const u = profileRes.data;
        setProfile(u);
        setFirstName(u.firstName);
        setLastName(u.lastName);
        setPhone(u.phone || '');
      }

      if (sessionsRes.data?.data) {
        setSessions(sessionsRes.data.data);
      } else if (Array.isArray(sessionsRes.data)) {
        setSessions(sessionsRes.data);
      }
    } catch (e) {
      console.error('Failed to load profile data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'First Name and Last Name are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.patch('/users/me', {
        firstName,
        lastName,
        phone: phone || null,
      });

      if (res.data?.data) {
        setProfile(res.data.data);
      } else if (res.data) {
        setProfile(res.data);
      }

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (e) {
      console.error('Failed to update profile', e);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900 px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6 mt-2">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Text className="text-white text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">Profile</Text>
        </View>

        {profile && !isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text className="text-blue-400 font-semibold text-sm">Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && !profile ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : !profile ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-lg">Failed to load profile data.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Avatar Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-blue-600 rounded-full justify-center items-center border-4 border-gray-800 shadow-md shadow-blue-500/20 mb-3">
              <Text className="text-white text-3xl font-black">
                {profile.firstName[0]?.toUpperCase()}
                {profile.lastName[0]?.toUpperCase()}
              </Text>
            </View>
            <Text className="text-white text-2xl font-black">
              {profile.firstName} {profile.lastName}
            </Text>
            <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mt-1">
              {profile.role.replace('_', ' ')}
            </Text>
          </View>

          {/* Profile Card */}
          <View className="bg-gray-800/40 border border-gray-800 rounded-3xl p-6 mb-6">
            <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">
              Account Information
            </Text>

            {isEditing ? (
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-400 text-xs mb-1 font-semibold">First Name</Text>
                  <TextInput
                    className="bg-gray-800 text-white px-4 py-2.5 rounded-xl border border-gray-700"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View className="mt-3">
                  <Text className="text-gray-400 text-xs mb-1 font-semibold">Last Name</Text>
                  <TextInput
                    className="bg-gray-800 text-white px-4 py-2.5 rounded-xl border border-gray-700"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>

                <View className="mt-3">
                  <Text className="text-gray-400 text-xs mb-1 font-semibold">Phone Number</Text>
                  <TextInput
                    className="bg-gray-800 text-white px-4 py-2.5 rounded-xl border border-gray-700"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View className="flex-row space-x-2 pt-4">
                  <TouchableOpacity
                    onPress={handleUpdateProfile}
                    className="flex-1 bg-blue-600 py-3 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold">Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setFirstName(profile.firstName);
                      setLastName(profile.lastName);
                      setPhone(profile.phone || '');
                    }}
                    className="flex-1 border border-gray-700 py-3 rounded-xl items-center"
                  >
                    <Text className="text-gray-400 font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="space-y-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-400 text-sm">Email Address</Text>
                  <Text className="text-white text-sm font-semibold">{profile.email}</Text>
                </View>
                <View className="flex-row justify-between mt-3">
                  <Text className="text-gray-400 text-sm">Phone Number</Text>
                  <Text className="text-white text-sm font-semibold">
                    {profile.phone || 'Not Specified'}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-3">
                  <Text className="text-gray-400 text-sm">Member Since</Text>
                  <Text className="text-white text-sm font-semibold">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Security Navigation Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Security')}
            className="bg-gray-800/40 border border-gray-800 rounded-3xl p-5 mb-6 flex-row justify-between items-center"
          >
            <View>
              <Text className="text-white font-bold text-base">Security Settings</Text>
              <Text className="text-gray-400 text-xs mt-1">
                Manage MFA, active sessions, and password updates
              </Text>
            </View>
            <Text className="text-blue-500 font-extrabold text-lg">›</Text>
          </TouchableOpacity>

          {/* Sessions Card */}
          {sessions.length > 0 && (
            <View className="bg-gray-800/40 border border-gray-800 rounded-3xl p-6 mb-10">
              <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">
                Active Login Sessions
              </Text>

              <View className="space-y-4">
                {sessions.map((sess) => (
                  <View
                    key={sess.id}
                    className="border-b border-gray-800 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0"
                  >
                    <Text className="text-white font-semibold text-sm">
                      {sess.deviceInfo || 'Unknown Device'}
                    </Text>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-gray-500 text-xs">IP: {sess.ipAddress}</Text>
                      <Text className="text-gray-500 text-xs">
                        Active: {new Date(sess.lastActiveAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
