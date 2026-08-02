# 📋 ANDROID PHYSICAL DEVICE USER ACCEPTANCE TEST (UAT)

**Target Build**: EAS Standalone Preview APK  
**EAS Build ID**: `8f22ea99-90e8-47b7-9a1e-16a30ef6c878`  
**Direct Download URL**: [https://expo.dev/artifacts/eas/hCKz9C1HRvDCvpN42MmijsMZzq6Pv9tjKWPIpIzdAIg.apk](https://expo.dev/artifacts/eas/hCKz9C1HRvDCvpN42MmijsMZzq6Pv9tjKWPIpIzdAIg.apk)  

---

## 📲 Physical Device Test Checklist

Please install the APK above on your physical Android device and mark each item as **PASS** [x] or **FAIL** [ ]:

- [ ] **Installation**: APK downloads & installs without package parse errors.
- [ ] **Launch**: App opens cleanly displaying MilkBoy animated Splash Screen.
- [ ] **UI Rendering**: All screens display dark-slate theme (`#0f172a`), styled buttons, inputs, & cards (no plain unstyled HTML elements).
- [ ] **Registration**: Registration accepts valid credentials (`Password@123!`) and displays password requirements.
- [ ] **Login**: Sign in succeeds with registered credentials & navigates to Dashboard.
- [ ] **Camera Permission**: Permission prompt appears & grants camera access.
- [ ] **Camera Preview**: Live camera feed renders smoothly with Flash (`auto`/`on`/`off`), Grid, Zoom, and Flip controls.
- [ ] **Capture & Preview**: Shutter button captures sample image & displays quality metrics preview.
- [ ] **AI Processing**: Scanning progress animation completes and loads AI Quality Assessment result.
- [ ] **Results Screen**: Shows quality badge, confidence %, breakdown metrics (Fat/SNF), and Share button.
- [ ] **Scan History**: Displays saved scans list with search & status filters.
- [ ] **Offline Mode**: Capturing a scan with Wi-Fi/data disabled saves scan locally to queue.
- [ ] **Synchronization**: Reconnecting Wi-Fi auto-synchronizes pending offline scans.
- [ ] **Reports View**: Displays certified quality reports list.
- [ ] **PDF Export & QR Code**: Report details screen displays digital verification QR code & triggers PDF export.
- [ ] **Notifications Hub**: Notifications list renders with unread count badges & category filters (`scans`, `reports`, `auth`).
- [ ] **Profile & Security**: Renders account info, active sessions list, & security settings.
- [ ] **Settings & Logout**: Settings navigation items work; Logout clears session tokens & returns to Login screen.
- [ ] **App Restart**: Reopening app retains active session without requiring re-login.
- [ ] **No Crashes**: Zero runtime crashes or unhandled exceptions across all navigation flows.
