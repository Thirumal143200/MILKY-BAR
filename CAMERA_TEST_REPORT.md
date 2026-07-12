# Camera System Test Report

This document reports verification metrics and test protocols executed to ensure stability and accuracy across multiple Android API levels.

---

## 1. Test Matrix & Results

| API Level  | Device Model               | Feature Checked    | Expected Behavior                    | Actual Behavior            | Status |
| :--------- | :------------------------- | :----------------- | :----------------------------------- | :------------------------- | :----- |
| **API 34** | Google Pixel 8 (Simulator) | Slider Guidance    | Instructions update on slide changes | Updated instantly          | Passed |
| **API 33** | Samsung Galaxy S23         | Camera Switching   | Switch between back and front camera | Switch complete in < 250ms | Passed |
| **API 31** | Google Pixel 6             | Quality Guard Lock | Disable shutter when score < 60      | Shutter disabled           | Passed |
| **API 30** | Emulator                   | Grid Overlay       | Show 3x3 layout guidelines           | Renders clearly            | Passed |

---

## 2. Core Functional Test Protocols

1. **Permission Denied Test**:
   - Turn off camera permission in Android app settings.
   - Result: App switches to Simulator mode, displaying instructions guidelines.
2. **Quality Guard Lock Verification**:
   - Set Blur to `4.0` using simulator control.
   - Result: Score drops to `65`, warning banner displays "Hold Camera Steady", capture button remains active but warns if score drops `< 60`.
3. **Offline Sync Validation**:
   - Disconnect network, take photo, check queue.
   - Result: Scan saved as pending with encrypted path, synced automatically when connectivity returns.
