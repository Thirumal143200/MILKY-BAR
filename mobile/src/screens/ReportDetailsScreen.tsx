import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView, Image } from 'react-native';
import { apiClient, API_URL } from '../api/client.js';

export default function ReportDetailsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { reportId } = route.params || {};
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await apiClient.get(`/reports/${reportId}`);
        setReport(res.data.data || res.data);
      } catch (error: any) {
        Alert.alert('Error', 'Failed to fetch report details.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleShare = () => {
    Alert.alert('Share Report', `Sharing PDF Report Link: ${API_URL}/reports/${reportId}/download`);
  };

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
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-lg">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Report Details</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-lg">Share</Text>
        </TouchableOpacity>
      </View>

      {/* Main Info */}
      <View className="p-6 space-y-6 flex-1 justify-between">
        <View className="space-y-4">
          <View className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Text className="text-sm font-semibold text-gray-400 mb-1">REPORT ID</Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">{report?.id}</Text>

            <Text className="text-sm font-semibold text-gray-400 mb-1">SCAN TITLE</Text>
            <Text className="text-base text-gray-900 dark:text-white mb-4">{report?.scanTitle || 'Milk Sample Scan'}</Text>

            <Text className="text-sm font-semibold text-gray-400 mb-1">QUALITY PREDICTION</Text>
            <Text className="text-base font-bold text-blue-600 dark:text-blue-400 mb-4 uppercase">
              {report?.prediction?.qualityLabel || 'Confirmed'}
            </Text>

            <Text className="text-sm font-semibold text-gray-400 mb-1">GENERATED AT</Text>
            <Text className="text-base text-gray-900 dark:text-white">
              {report?.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}
            </Text>
          </View>

          {/* Verification QR section */}
          <View className="items-center bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2">
            <Text className="text-base font-bold text-gray-900 dark:text-white">QR Code Verification</Text>
            <Text className="text-xs text-gray-400 text-center mb-4">
              Scan this code to verify the authenticity of this milk quality report.
            </Text>
            {/* Direct QR render from API */}
            <Image
              source={{ uri: `${API_URL}/reports/${reportId}/qr` }}
              className="w-48 h-48 bg-white rounded-xl"
              resizeMode="contain"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => Alert.alert('Downloading', 'Downloading report PDF file...')}
          className="w-full bg-blue-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">Download PDF Document</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
