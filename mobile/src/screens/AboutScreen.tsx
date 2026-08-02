import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About MIRA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandBox}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>🥛</Text>
          </View>
          <Text style={styles.brandTitle}>MIRA</Text>
          <Text style={styles.brandVersion}>VERSION 1.0.0 — GOLD MASTER</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>The Platform</Text>
          <Text style={styles.bodyText}>
            MIRA is an enterprise, production-quality solution designed to optimize milk quality
            verification. By linking smart camera inputs directly with heuristic and CNN
            classifiers, MIRA empowers producers, consumers, and lab testing staff to verify milk
            freshness instantly.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.cardSectionTitle}>The Technology</Text>
          <Text style={styles.bodyText}>
            Our multi-spectral image processing pipeline checks color profiles, reflectance ratios,
            and lighting balance. This is coupled with a scalable microservice architecture built on
            Express.js, PostgreSQL/SQLite database models, and PyTorch deep learning prediction
            engines.
          </Text>
        </View>

        <View style={styles.footerBox}>
          <Text style={styles.footerText}>
            © 2026 MIRA ENTERPRISE PLATFORM. ALL RIGHTS RESERVED.
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
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
  brandBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 44,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandVersion: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 2,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  cardSectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  bodyText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  footerBox: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
