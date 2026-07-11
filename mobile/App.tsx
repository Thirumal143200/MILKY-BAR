import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// NativeWind v4 requires this
import './global.css';

// Zustand Auth Store
import { useAuthStore } from './src/store/authStore.js';

// Screens
import SplashScreen from './src/screens/SplashScreen.js';
import OnboardingScreen from './src/screens/OnboardingScreen.js';
import LoginScreen from './src/screens/LoginScreen.js';
import RegisterScreen from './src/screens/RegisterScreen.js';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen.js';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen.js';
import MfaVerificationScreen from './src/screens/MfaVerificationScreen.js';

import HomeScreen from './src/screens/HomeScreen.js';
import CameraScreen from './src/screens/CameraScreen.js';
import PreviewScreen from './src/screens/PreviewScreen.js';
import ProcessingScreen from './src/screens/ProcessingScreen.js';
import ResultScreen from './src/screens/ResultScreen.js';
import ReportsScreen from './src/screens/ReportsScreen.js';
import ReportDetailsScreen from './src/screens/ReportDetailsScreen.js';

import ScanHistoryScreen from './src/screens/ScanHistoryScreen.js';
import ScanDetailsScreen from './src/screens/ScanDetailsScreen.js';
import NotificationsScreen from './src/screens/NotificationsScreen.js';
import NotificationDetailsScreen from './src/screens/NotificationDetailsScreen.js';

import ProfileScreen from './src/screens/ProfileScreen.js';
import EditProfileScreen from './src/screens/EditProfileScreen.js';
import SettingsScreen from './src/screens/SettingsScreen.js';
import SecurityScreen from './src/screens/SecurityScreen.js';
import HelpScreen from './src/screens/HelpScreen.js';
import AboutScreen from './src/screens/AboutScreen.js';
import PrivacyScreen from './src/screens/PrivacyScreen.js';
import TermsScreen from './src/screens/TermsScreen.js';
import FeedbackScreen from './src/screens/FeedbackScreen.js';

const Stack = createNativeStackNavigator();

export default function App() {
  const { isAuthenticated, loadSession, isLoading } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoading ? (
            <Stack.Screen name="Splash" component={SplashScreen} />
          ) : !isAuthenticated ? (
            // Auth Stack
            <>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              <Stack.Screen name="MfaVerification" component={MfaVerificationScreen} />
            </>
          ) : (
            // App Stack (Protected)
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="Camera"
                component={CameraScreen}
                options={{ presentation: 'fullScreenModal' }}
              />
              <Stack.Screen
                name="Preview"
                // @ts-expect-error - Expected navigation types
                component={PreviewScreen}
                options={{ presentation: 'fullScreenModal' }}
              />
              <Stack.Screen name="Processing" component={ProcessingScreen} />
              <Stack.Screen name="Result" component={ResultScreen} />
              <Stack.Screen name="Reports" component={ReportsScreen} />
              <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
              <Stack.Screen name="ScanHistory" component={ScanHistoryScreen} />
              <Stack.Screen name="ScanDetails" component={ScanDetailsScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Security" component={SecurityScreen} />
              <Stack.Screen name="Help" component={HelpScreen} />
              <Stack.Screen name="About" component={AboutScreen} />
              <Stack.Screen name="Privacy" component={PrivacyScreen} />
              <Stack.Screen name="Terms" component={TermsScreen} />
              <Stack.Screen name="Feedback" component={FeedbackScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
