import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900 px-4">
      {/* Header */}
      <View className="flex-row items-center mb-6 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">Terms of Service</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-10">
        <View className="bg-gray-800/40 border border-gray-800 rounded-3xl p-6 mb-8 space-y-6">
          <View>
            <Text className="text-white font-extrabold text-lg mb-2">1. Terms Acceptance</Text>
            <Text className="text-gray-300 text-sm leading-relaxed">
              By accessing and logging into the MilkBoy platform, you agree to comply with and be
              bound by these terms. If you do not accept these terms, please delete your credentials
              and remove the application.
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-white font-extrabold text-lg mb-2">
              2. AI Estimation Disclaimer
            </Text>
            <Text className="text-gray-300 text-sm leading-relaxed">
              The quality classifications and indices provided by the AI model are advisory
              calculations based on colorimetry metrics. They do NOT constitute official laboratory
              certifications. Crucial commercial decisions should be backed by certified laboratory
              parameters.
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-white font-extrabold text-lg mb-2">3. Account Security</Text>
            <Text className="text-gray-300 text-sm leading-relaxed">
              Users are responsible for keeping passwords confidential. System locks trigger
              automatically after 5 consecutive failed login attempts to prevent brute-force
              intrusion. Multi-Factor Authentication (MFA) is highly recommended.
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-white font-extrabold text-lg mb-2">4. Acceptable Usage</Text>
            <Text className="text-gray-300 text-sm leading-relaxed">
              Uploading malicious scripts, off-topic file formats, or performing denial-of-service
              tests on our REST API endpoints is strictly prohibited and will result in permanent
              account suspension and audit log logging.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
