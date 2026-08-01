# MilkBoy Enterprise Platform — Play Store Release Guide

## Prerequisites
- **Google Play Console Developer Account**: Active
- **App Package Name**: `com.anonymous.mobile`
- **Signing Credentials**: Managed automatically via EAS Credentials (Keystore)

---

## Step 1: Building Production Android App Bundle (.aab)
Run the production build profile:

```bash
cd mobile
eas build --platform android --profile production
```

EAS automatically manages the release keystore, signs the AAB, and produces an optimized `.aab` file ready for upload to Google Play Console.

---

## Step 2: Automated Play Store Deployment (Optional via EAS Submit)
To submit the built AAB directly from CLI:

```bash
cd mobile
eas submit --platform android --profile production
```

---

## Step 3: Google Play Console Store Setup Checklist
1. **Store Listing**: Upload App Icon (512x512), Feature Graphic (1024x500), and phone/tablet screenshots.
2. **App Content**: Complete Data Safety questionnaire, Content Rating, and Privacy Policy link.
3. **Internal / Production Track**: Upload the generated `.aab` file, specify release notes, and rollout to users.
