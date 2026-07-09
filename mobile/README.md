# MilkBoy Mobile App

The native Android application for instant milk quality assessment via AI.

## Architecture

- **Framework**: React Native (Expo)
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand
- **Camera integration**: react-native-vision-camera

## Building via EAS

This project is configured to use Expo Application Services (EAS).

1. Install EAS CLI: `npm install -g eas-cli`
2. Authenticate: `eas login`
3. Generate Debug APK: `eas build --platform android --profile preview`
4. Generate Production AAB: `eas build --platform android --profile production`
