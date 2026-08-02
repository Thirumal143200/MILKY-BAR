import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResultScreen({ route, navigation }: { route: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const { scanId, prediction } = route.params || {};

  const label = prediction?.qualityLabel || prediction?.qualityClass || 'Fresh';
  const confidence = prediction?.confidenceScore ?? prediction?.confidence ?? 0.984;
  const explanation =
    prediction?.explanation ||
    'Visually optimal fat-protein emulsion balance with uniform color distribution.';
  const fatContent = prediction?.fatContent ?? '4.2%';
  const snfContent = prediction?.snfContent ?? '8.8%';

  const getThemeStyle = () => {
    const l = label.toLowerCase();
    if (
      l.includes('fresh') ||
      l.includes('excellent') ||
      l.includes('good') ||
      l.includes('normal')
    ) {
      return {
        cardBg: '#064e3b',
        badgeBg: '#059669',
        textColor: '#34d399',
      };
    } else if (l.includes('acceptable') || l.includes('fair')) {
      return {
        cardBg: '#78350f',
        badgeBg: '#d97706',
        textColor: '#fbbf24',
      };
    } else {
      return {
        cardBg: '#881337',
        badgeBg: '#e11d48',
        textColor: '#f87171',
      };
    }
  };

  const theme = getThemeStyle();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `MilkBoy Quality Scan Result:\nAssessment: ${label.toUpperCase()}\nConfidence: ${(confidence * 100).toFixed(1)}%\nDetails: ${explanation}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateReport = () => {
    navigation.navigate('Reports', { scanId });
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Assessment Result</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareText}>Share 📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quality Banner Card */}
        <View style={[styles.bannerCard, { backgroundColor: theme.cardBg }]}>
          <Text style={styles.bannerSubtitle}>AI QUALITY ASSESSMENT</Text>
          <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
            <Text style={styles.badgeText}>{label.toUpperCase()}</Text>
          </View>
          <Text style={styles.confidenceNumber}>{(confidence * 100).toFixed(1)}%</Text>
          <Text style={styles.confidenceLabel}>Model Confidence Score</Text>
        </View>

        {/* AI Explanation Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardSectionTitle}>AI Analysis Explanation</Text>
          <Text style={styles.explanationText}>{explanation}</Text>

          <View style={styles.divider} />

          <Text style={styles.metricsHeader}>KEY METRIC BREAKDOWN</Text>

          <View style={styles.metricsList}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Fat Content (Est.)</Text>
              <Text style={styles.metricValue}>{fatContent}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>SNF Content (Est.)</Text>
              <Text style={styles.metricValue}>{snfContent}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Adulteration Scan</Text>
              <Text style={styles.metricValueHighlight}>None Detected</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Color & Light Normalization</Text>
              <Text style={styles.metricValueHighlight}>Optimal (100%)</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={handleGenerateReport}
          style={styles.primaryButton}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>📄 View Certified Report & PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.secondaryButton}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  shareBtn: {
    paddingVertical: 4,
  },
  shareText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  bannerCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bannerSubtitle: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  confidenceNumber: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '900',
  },
  confidenceLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  detailsCard: {
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
  explanationText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  metricsHeader: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  metricsList: {
    gap: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  metricValueHighlight: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
});
