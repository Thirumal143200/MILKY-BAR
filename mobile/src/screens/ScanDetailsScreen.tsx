import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { apiClient } from '../api/client';

export default function ScanDetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { scanId } = route.params || {};
  const [scan, setScan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScanDetails = async () => {
      try {
        const res = await apiClient.get(`/scans/${scanId}`);
        setScan(res.data.data || res.data);
      } catch {
        Alert.alert('Error', 'Failed to fetch scan details.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchScanDetails();
  }, [scanId]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-lg">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Scan Details</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="space-y-6">
          <View className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Text className="text-sm font-semibold text-gray-400 mb-1">SCAN ID</Text>
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-4">
              {scan?.id}
            </Text>

            <Text className="text-sm font-semibold text-gray-400 mb-1">TITLE</Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {scan?.title}
            </Text>

            <Text className="text-sm font-semibold text-gray-400 mb-1">NOTES</Text>
            <Text className="text-base text-gray-700 dark:text-gray-300 mb-4">
              {scan?.notes || 'No description provided.'}
            </Text>

            <Text className="text-sm font-semibold text-gray-400 mb-1">STATUS</Text>
            <View className="flex-row items-center mt-1">
              <View
                className={`px-3 py-1 rounded-full ${scan?.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}
              >
                <Text
                  className={`font-semibold text-sm ${scan?.status === 'completed' ? 'text-green-800' : 'text-yellow-800'}`}
                >
                  {scan?.status?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Predictions Summary */}
          {scan?.prediction && (
            <View className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-4">
                AI Prediction Run
              </Text>

              <Text className="text-sm font-semibold text-gray-400 mb-1">QUALITY LABEL</Text>
              <Text className="text-base font-bold text-blue-600 dark:text-blue-400 mb-4 uppercase">
                {scan.prediction.qualityLabel}
              </Text>

              <Text className="text-sm font-semibold text-gray-400 mb-1">CONFIDENCE SCORE</Text>
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-4">
                {(scan.prediction.confidence * 100).toFixed(1)}%
              </Text>

              <Text className="text-sm font-semibold text-gray-400 mb-1">DETAILED PARAMETERS</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Adulterants: {scan.prediction.adulterants?.join(', ') || 'None detected'}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View className="space-y-3 mt-4">
            <TouchableOpacity
              onPress={() => navigation.navigate('Result', { scanId: scan.id })}
              className="w-full bg-blue-600 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-base">View Quality Assessment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Reports', { scanId: scan.id })}
              className="w-full bg-gray-100 dark:bg-gray-800 py-4 rounded-xl items-center"
            >
              <Text className="text-gray-800 dark:text-gray-200 font-bold text-base">
                View Report Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
