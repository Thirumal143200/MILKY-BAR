# MilkBoy Enterprise Platform — Android APK & AAB Build Guide

## Overview

This document provides step-by-step instructions for building, packaging, installing, and deploying the MilkBoy Enterprise Mobile Application built on Expo SDK 57 and React Native 0.86.2.

---

## Environment Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **Expo CLI**: `npx expo`
- **EAS CLI**: `npx eas-cli`
- **Android Studio / Android SDK**: API Level 34 (Android 14) / Build Tools 34.0.0
- **Java Development Kit (JDK)**: OpenJDK 17

---

## 1. Local Prebuild Verification

Before generating native builds, run local validation:

```bash
cd mobile

# 1. Verify Expo Doctor (Must return 20/20 checks passed)
npx expo-doctor

# 2. Verify TypeScript Compilation
npm run type-check

# 3. Clean Native Code Prebuild
npx expo prebuild --clean
```

---

## 2. Generating Android Builds via EAS Cloud

### Preview APK (For Testing & Installation on Physical Devices)

```bash
cd mobile
eas build --platform android --profile preview
```

_Output_: `.apk` standalone binary file installable directly on physical Android phones.

### Production AAB (For Google Play Store Release)

```bash
cd mobile
eas build --platform android --profile production
```

_Output_: `.aab` (Android App Bundle) optimized for Play Store distribution.

---

## 3. Local Native Android Build (Android Studio / Gradle)

If building locally without cloud dependency:

```bash
cd mobile

# Generate android folder
npx expo prebuild

# Build Release APK locally via Gradle
cd android
./gradlew assembleRelease
```

_Output location_: `mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 4. Installing APK on Physical Android Device

1. Enable **Developer Options** and **USB Debugging** on your Android phone.
2. Connect your phone via USB.
3. Verify connection:
   ```bash
   adb devices
   ```
4. Install the generated APK:
   ```bash
   adb install -r path/to/app-release.apk
   ```

---

## 5. Environment Variables & API Gateway Configuration

Set the backend server URL in `mobile/src/api/client.ts` or via environment configuration:

- **Android Emulator**: `http://10.0.2.2:3001/api/v1`
- **Physical Device (Same Wi-Fi)**: `http://<YOUR_LOCAL_IP>:3001/api/v1`
- **Production Server**: `https://api.milkboy.enterprise.com/api/v1`
