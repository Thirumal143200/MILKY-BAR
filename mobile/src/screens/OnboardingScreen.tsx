import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Instant Milk Quality Analysis',
    description: 'Scan and predict milk quality instantly using advanced CNN models in real-time.',
    icon: '🥛',
  },
  {
    title: 'Laboratory Validations',
    description: 'Ensure safety and verification by integrating directly with laboratory verification queues.',
    icon: '🔬',
  },
  {
    title: 'Secure & Transparent Logs',
    description: 'Audit logs, secure MFA verification, and tamper-proof PDF reports protect your logs.',
    icon: '🛡️',
  },
];

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const slide = slides[currentSlideIndex]!;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 justify-between px-6 py-8">
      {/* Skip Button */}
      <View className="flex-row justify-end">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-base">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Content */}
      <View className="items-center px-4">
        <Text className="text-8xl mb-8">{slide.icon}</Text>
        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
          {slide.title}
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6">
          {slide.description}
        </Text>
      </View>

      {/* Dot Indicators & Next Button */}
      <View className="space-y-6">
        {/* Indicators */}
        <View className="flex-row justify-center space-x-2">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === currentSlideIndex
                  ? 'w-6 bg-blue-600 dark:bg-blue-400'
                  : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="w-full bg-blue-600 dark:bg-blue-500 py-4 rounded-xl items-center justify-center shadow-sm"
        >
          <Text className="text-white font-bold text-lg">
            {currentSlideIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
