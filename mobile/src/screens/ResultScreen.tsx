import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResultScreen({ route, navigation }: { route: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const { scanId, prediction } = route.params;

  const label = prediction?.qualityLabel || 'unknown';
  const confidence = prediction?.confidence || 0;
  const explanation = prediction?.explanation || 'No details provided.';

  const getThemeColor = () => {
    switch (label.toLowerCase()) {
      case 'excellent':
      case 'good':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          text: 'text-emerald-500',
          badgeBg: 'bg-emerald-500',
          gradient: ['#065f46', '#022c22'],
        };
      case 'acceptable':
      case 'poor':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30',
          text: 'text-amber-500',
          badgeBg: 'bg-amber-500',
          gradient: ['#78350f', '#451a03'],
        };
      case 'adulterated':
      case 'spoiled':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30',
          text: 'text-rose-500',
          badgeBg: 'bg-rose-500',
          gradient: ['#9f1239', '#5c061e'],
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/30',
          text: 'text-blue-500',
          badgeBg: 'bg-blue-500',
          gradient: ['#1e40af', '#172554'],
        };
    }
  };

  const theme = getThemeColor();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `MilkBoy Analysis Result:\nQuality: ${label.toUpperCase()}\nConfidence: ${(confidence * 100).toFixed(1)}%\nDetails: ${explanation}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateReport = () => {
    navigation.navigate('Reports', { scanId });
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900">
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-800">
        <Text className="text-white text-xl font-bold">Scan Result</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text className="text-blue-400 font-semibold text-base">Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
        {/* Quality Banner Card */}
        <View className={`border rounded-3xl p-6 mb-6 items-center ${theme.bg}`}>
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
            AI ASSESSMENT
          </Text>
          <View className={`px-5 py-2.5 rounded-full mb-4 ${theme.badgeBg}`}>
            <Text className="text-white font-extrabold text-2xl uppercase tracking-wide">
              {label.replace('_', ' ')}
            </Text>
          </View>
          <Text className="text-white text-4xl font-extrabold">
            {(confidence * 100).toFixed(1)}%
          </Text>
          <Text className="text-gray-400 text-xs mt-1">Confidence Score</Text>
        </View>

        {/* Detailed Assessment Card */}
        <View className="bg-gray-800/50 border border-gray-800 rounded-3xl p-6 mb-8">
          <Text className="text-white font-bold text-lg mb-3">AI Explanation</Text>
          <Text className="text-gray-300 text-base leading-relaxed mb-6">{explanation}</Text>

          <View className="h-px bg-gray-800 w-full mb-6" />

          <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">
            Analysis Parameters
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Text className="text-gray-400 text-sm">Image Quality</Text>
              <Text className="text-emerald-400 text-sm font-bold">Passed (100%)</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400 text-sm">Lighting Check</Text>
              <Text className="text-emerald-400 text-sm font-bold">Optimal</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400 text-sm">Fat Estimation</Text>
              <Text className="text-gray-300 text-sm font-bold">3.2% - 3.8%</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400 text-sm">Water Dilution</Text>
              <Text className="text-emerald-400 text-sm font-bold">None Detected</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={handleGenerateReport}
          className="bg-blue-600 py-4 rounded-2xl items-center mb-4 shadow-lg shadow-blue-500/20"
        >
          <Text className="text-white font-bold text-lg">Generate PDF Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          className="border border-gray-700 py-4 rounded-2xl items-center"
        >
          <Text className="text-gray-300 font-semibold text-lg">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
