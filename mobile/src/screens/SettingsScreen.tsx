import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_role');
    navigation.replace('Login');
  };

  const sections = [
    {
      title: 'ACCOUNT & SECURITY',
      items: [
        { label: 'User Profile', icon: '👤', route: 'Profile' },
        { label: 'Security & Password', icon: '🔐', route: 'Security' },
        { label: 'Scan History', icon: '📁', route: 'ScanHistory' },
      ],
    },
    {
      title: 'SUPPORT & FEEDBACK',
      items: [
        { label: 'Help Center & FAQ', icon: '❓', route: 'Help' },
        { label: 'Send Feedback', icon: '💬', route: 'Feedback' },
      ],
    },
    {
      title: 'LEGAL & ABOUT',
      items: [
        { label: 'About MilkBoy', icon: 'ℹ️', route: 'About' },
        { label: 'Privacy Policy', icon: '🛡️', route: 'Privacy' },
        { label: 'Terms of Service', icon: '📜', route: 'Terms' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  onPress={() => navigation.navigate(item.route)}
                  style={[styles.row, itemIdx !== section.items.length - 1 && styles.rowBorder]}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowIcon}>{item.icon}</Text>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.85}>
          <Text style={styles.logoutText}>🚪 Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
  scrollContent: {
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  rowLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  chevron: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    color: '#f87171',
    fontWeight: '800',
    fontSize: 16,
  },
});
