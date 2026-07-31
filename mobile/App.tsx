import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// NativeWind v4 requires this
import './global.css';

// Zustand Auth Store
import { useAuthStore } from './src/store/authStore';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import MfaVerificationScreen from './src/screens/MfaVerificationScreen';

import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import ResultScreen from './src/screens/ResultScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ReportDetailsScreen from './src/screens/ReportDetailsScreen';

import ScanHistoryScreen from './src/screens/ScanHistoryScreen';
import ScanDetailsScreen from './src/screens/ScanDetailsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import NotificationDetailsScreen from './src/screens/NotificationDetailsScreen';

import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import HelpScreen from './src/screens/HelpScreen';
import AboutScreen from './src/screens/AboutScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import TermsScreen from './src/screens/TermsScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';

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
