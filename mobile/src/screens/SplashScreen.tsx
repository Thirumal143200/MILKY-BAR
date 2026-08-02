import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }: { navigation: any }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
    <View style={styles.container} className="flex-1 bg-gray-900 justify-center items-center">
      <Animated.View
        style={[
          styles.contentBox,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🥛</Text>
        </View>
        <Text style={styles.titleText}>MilkBoy</Text>
        <Text style={styles.subtitleText}>AI QUALITY SCAN</Text>
      </Animated.View>

      <View style={styles.footerBox}>
        <Text style={styles.footerText}>POWERED BY DEEPLEARNING</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentBox: {
    alignItems: 'center',
  },
  iconBox: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 44,
  },
  titleText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: 3,
  },
  footerBox: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    letterSpacing: 2,
    fontWeight: '600',
  },
});
