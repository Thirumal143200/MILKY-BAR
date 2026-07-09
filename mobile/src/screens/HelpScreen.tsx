import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'How do I take a good sample photo?',
      answer:
        'Place the milk sample in a clean, transparent glass against a neutral background. Ensure there is plenty of natural light but avoid direct sunlight/glare. Hold the camera steady at about 10-15cm directly above the cup.',
    },
    {
      question: 'How does the AI Quality Scan work?',
      answer:
        'The app analyzes the color profile, reflectance, and white balance using advanced image processing. The data is processed by our machine learning model which classifies quality into grades (Excellent, Good, Acceptable, Poor, Adulterated, Spoiled).',
    },
    {
      question: 'What do the different quality grades mean?',
      answer:
        '• Excellent/Good: Pure, fresh milk ready for consumption.\n• Acceptable/Poor: Safe but display slight discoloration or aging.\n• Adulterated: Off-ratio parameters, indicating potential water or additive dilution.\n• Spoiled: High microbial activity, sour, unsafe to consume.',
    },
    {
      question: 'Does the app work offline?',
      answer:
        'Yes! You can take sample scans offline. The app saves the images locally and will automatically queue and sync them for AI analysis when you reconnect to the internet.',
    },
  ];

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-gray-900 px-4">
      {/* Header */}
      <View className="flex-row items-center mb-6 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">Help Center</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Scanning Guidelines Section */}
        <View className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-3xl mb-6">
          <Text className="text-blue-400 font-extrabold text-base mb-3 uppercase tracking-wider">
            📸 Scanning Best Practices
          </Text>
          <View className="space-y-3">
            <Text className="text-gray-300 text-sm leading-relaxed">
              • <Text className="font-bold text-white">Clean Glassware</Text>: Always use clean,
              dry, transparent cups or containers.
            </Text>
            <Text className="text-gray-300 text-sm leading-relaxed mt-2">
              • <Text className="font-bold text-white">Uniform Lighting</Text>: Test in bright,
              indirect indoor lighting. Direct camera flashes may distort color metrics.
            </Text>
            <Text className="text-gray-300 text-sm leading-relaxed mt-2">
              • <Text className="font-bold text-white">Focus & Depth</Text>: Wait for the camera to
              auto-focus. The lens should be parallel to the surface.
            </Text>
          </View>
        </View>

        <Text className="text-white font-extrabold text-xl mb-4">Frequently Asked Questions</Text>

        {/* FAQs */}
        <View className="space-y-3 mb-10">
          {faqs.map((faq, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
              className="bg-gray-800/40 border border-gray-800 p-4 rounded-2xl mb-3"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-bold text-base flex-1 pr-4">{faq.question}</Text>
                <Text className="text-blue-500 text-xl font-bold">
                  {activeFAQ === idx ? '−' : '+'}
                </Text>
              </View>
              {activeFAQ === idx && (
                <Text className="text-gray-300 text-sm mt-3 leading-relaxed border-t border-gray-800/80 pt-3">
                  {faq.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
