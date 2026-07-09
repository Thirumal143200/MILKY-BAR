import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900 px-4">
      {/* Header */}
      <View className="flex-row items-center mb-6 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">Privacy Policy</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-10">
        <View className="bg-gray-800/40 border border-gray-800 rounded-3xl p-6 mb-8 space-y-6">
          <View>
            <Text className="text-white font-extrabold text-lg mb-2">1. Data We Collect</Text>
            <Text className="text-gray-300 text-sm leading-relaxed">
              We collect sample images captured by the device camera, GPS coordinates associated
              with the scan (to compile geolocation batch records, if permissions are provided), and
              profile details like your name and contact phone number.
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-white font-extrabold text-lg mb-2">2. How We Use Data</Text>
            <Text className="text-gray-300 text-sm leading-relaxed">
              Captured images are used exclusively to calculate colorimetry values, density ratios,
              and light reflectance. This allows our machine learning model to estimate quality
              classifications and generate downloadable verification reports.
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-white font-extrabold text-lg mb-2">3. Storage & Protection</Text>
            <Text className="text-gray-300 text-sm leading-relaxed">
              All credentials and JWT payloads are encrypted. Scans are stored locally on the
              device's secure storage until synchronized. Once uploaded, records are stored in
              databases configured with strict access controls and transport layer encryption.
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-white font-extrabold text-lg mb-2">4. Your Rights</Text>
            <Text className="text-gray-300 text-sm leading-relaxed">
              You maintain full ownership of your data history. You can request deletion of
              individual scans, batch files, or your entire user account at any time via the Support
              panel or by sending feedback.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
