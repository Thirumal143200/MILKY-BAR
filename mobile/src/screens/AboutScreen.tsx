import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900 px-4">
      {/* Header */}
      <View className="flex-row items-center mb-6 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">About MilkBoy</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="items-center my-6">
          <View className="w-24 h-24 bg-blue-600/10 border border-blue-500/20 rounded-3xl justify-center items-center mb-4">
            <Text className="text-5xl">🥛</Text>
          </View>
          <Text className="text-white text-2xl font-black">MilkBoy AI</Text>
          <Text className="text-blue-400 font-bold text-sm tracking-wider uppercase mt-1">
            Version 1.0.0
          </Text>
        </View>

        <View className="bg-gray-800/40 border border-gray-800 rounded-3xl p-6 mb-8 space-y-4">
          <Text className="text-white font-extrabold text-base">The Platform</Text>
          <Text className="text-gray-300 text-sm leading-relaxed">
            MilkBoy is a comprehensive, production-quality solution designed to optimize milk
            quality verification. By linking smart camera inputs directly with heuristic and CNN
            classifiers, MilkBoy empowers local producers, consumers, and lab testing staff to
            verify freshness instantly.
          </Text>

          <View className="h-px bg-gray-800 my-4" />

          <Text className="text-white font-extrabold text-base">The Technology</Text>
          <Text className="text-gray-300 text-sm leading-relaxed">
            Our image processing pipeline checks color profiles, reflectance ratios, and lighting
            balance. This is coupled with a microservice architecture built on Express.js,
            PostgreSQL/SQLite database models, and FastAPI deep learning prediction engines.
          </Text>
        </View>

        <View className="items-center pb-10">
          <Text className="text-gray-600 text-xs font-semibold tracking-wider">
            COPR. 2026 MILKBOY GROUP. ALL RIGHTS RESERVED.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
