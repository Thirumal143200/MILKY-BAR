import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
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

      const u = profileRes.data?.data || profileRes.data;
      if (u) {
        setProfile(u);
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setPhone(u.phone || '');
      }

      const s = sessionsRes.data?.data || sessionsRes.data;
      if (Array.isArray(s)) {
        setSessions(s);
      }
    } catch (error) {
      console.warn('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await apiClient.put('/users/me', {
        firstName,
        lastName,
        phone: phone || undefined,
      });

      Alert.alert('Profile Updated', 'Your profile details have been updated successfully.');
      setIsEditing(false);
      loadProfileData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      Alert.alert('Update Failed', msg);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient.delete(`/users/me/sessions/${sessionId}`);
      Alert.alert('Session Revoked', 'The device session has been logged out.');
      loadProfileData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to revoke session.');
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      await apiClient.delete('/users/me/sessions/other');
      Alert.alert('Sessions Revoked', 'All other active sessions have been logged out.');
      loadProfileData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to revoke other sessions.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Loading Account Profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing((prev) => !prev)}>
          <Text style={styles.editLink}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text style={styles.nameText}>
            {profile?.firstName} {profile?.lastName}
          </Text>
          <Text style={styles.emailText}>{profile?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{profile?.role?.toUpperCase() || 'USER'}</Text>
          </View>
        </View>

        {/* Profile Details / Edit Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          {isEditing ? (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{profile?.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{profile?.phone || 'Not provided'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role</Text>
                <Text style={styles.detailValue}>{profile?.role}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Member Since</Text>
                <Text style={styles.detailValue}>
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Sessions Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Active Sessions</Text>
            {sessions.length > 1 && (
              <TouchableOpacity onPress={handleRevokeAllOther}>
                <Text style={styles.revokeAllText}>Logout Others</Text>
              </TouchableOpacity>
            )}
          </View>

          {sessions.length === 0 ? (
            <Text style={styles.emptySessionsText}>No active sessions retrieved.</Text>
          ) : (
            sessions.map((sess) => (
              <View key={sess.id} style={styles.sessionCard}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDevice}>{sess.deviceInfo || 'Unknown Device'}</Text>
                  <Text style={styles.sessionIp}>IP: {sess.ipAddress || '127.0.0.1'}</Text>
                  <Text style={styles.sessionTime}>
                    Active: {new Date(sess.lastActiveAt).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRevokeSession(sess.id)}
                  style={styles.revokeButton}
                >
                  <Text style={styles.revokeButtonText}>Revoke</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  editLink: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarIcon: {
    fontSize: 36,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  roleBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  revokeAllText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
  formContainer: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 12,
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
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySessionsText: {
    color: '#64748b',
    fontSize: 13,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDevice: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sessionIp: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  sessionTime: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  revokeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  revokeButtonText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700',
  },
});
