import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }: { navigation: any }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Check token after 2 seconds
    const checkAuth = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (token) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      } catch {
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(checkAuth);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <View className="flex-1 bg-gray-900 justify-center items-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        {/* Neon style milk icon mockup */}
        <View className="w-24 h-24 bg-blue-600/20 border-2 border-blue-500 rounded-3xl justify-center items-center shadow-lg shadow-blue-500/50 mb-6">
          <Text className="text-4xl">🥛</Text>
        </View>
        <Text className="text-5xl font-extrabold text-white tracking-wider mb-2">MilkBoy</Text>
        <Text className="text-blue-400 font-semibold text-lg uppercase tracking-widest">
          AI Quality Scan
        </Text>
      </Animated.View>

      <View className="absolute bottom-12 items-center">
        <Text className="text-gray-500 text-xs tracking-wider">POWERED BY DEEPLEARNING</Text>
      </View>
    </View>
  );
}
