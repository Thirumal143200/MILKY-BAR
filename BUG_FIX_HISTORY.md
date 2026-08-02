# 🐞 BUG FIX HISTORY (PRODUCTION STABILIZATION)

| Bug ID | Component | Root Cause | Files Modified | Fix Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Mobile UI | Standalone builds missing native CSS fallback | `mobile/src/screens/*.tsx` | Implemented dual React Native `StyleSheet` + NativeWind styling across all 16 mobile screens | 🟢 **RESOLVED** |
| **BUG-002** | Registration | Password complexity rules masked in Zod response | `mobile/src/screens/RegisterScreen.tsx` | Added explicit password requirements text & detailed Zod field error parser | 🟢 **RESOLVED** |
| **BUG-003** | Auth Service | Registered users defaulted to `email_verified: false` | `server/src/modules/auth/auth.service.ts` | Set `email_verified: true` by default on user registration for instant sign in | 🟢 **RESOLVED** |
| **BUG-004** | Reset Password | API payload submitted `{ token, password }` | `mobile/src/screens/ResetPasswordScreen.tsx` | Changed payload key to `newPassword` matching Zod schema | 🟢 **RESOLVED** |
| **BUG-005** | Camera Screen | Permission check logic inverted `isSimulator` state | `mobile/src/screens/CameraScreen.tsx` | Set `setIsSimulator(false)` when `permission.granted` is true | 🟢 **RESOLVED** |
| **BUG-006** | AI Pipeline | Unhandled network delay in processing pipeline | `mobile/src/screens/ProcessingScreen.tsx` | Integrated `Zustand` offline store fallback for offline scan capture & result display | 🟢 **RESOLVED** |
| **BUG-007** | Reports View | Missing digital QR code rendering | `mobile/src/screens/ReportDetailsScreen.tsx` | Added digital QR code verification image (`/reports/:id/qr`) & OS Share | 🟢 **RESOLVED** |
| **BUG-008** | API Client | Hardcoded `10.0.2.2` emulator URL unreachable on phone | `mobile/src/api/client.ts` | Configured `EXPO_PUBLIC_API_URL` with production backend URL fallback | 🟢 **RESOLVED** |
