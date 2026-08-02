# ⚠️ FINAL RUNTIME LIMITATIONS (PRODUCTION AUDIT)

**Date**: August 2, 2026  
**Application Version**: v1.0.0  

---

## 1. Documented Technical Limitations

1. **Hardware Camera vs. Image Quality Guidance Metrics**:
   - Camera lighting (exposure), blur detection, and distance metrics in `CameraScreen.tsx` are computed using image histogram/laplacian variance analysis and calibrated threshold algorithms. On emulator devices without hardware camera sensors, simulator calibration controls are provided for testing.
2. **Production Backend Connectivity**:
   - The default mobile client `API_URL` uses `process.env.EXPO_PUBLIC_API_URL` or falls back to `https://milkboy-server.onrender.com/api/v1`. If testing on a local development network without internet, update `EXPO_PUBLIC_API_URL` to your computer's local Wi-Fi IP address (e.g. `http://192.168.1.X:3001/api/v1`).
3. **Push Notification Credentials (FCM / APNs)**:
   - Push notifications hub (`NotificationsScreen.tsx`) fully renders in-app notifications, category filtering, unread badge counts, and read status updates. Production FCM (Firebase Cloud Messaging) server keys must be configured in `app.json` for hardware push token dispatch.
4. **AI Inference Microservice Fallback**:
   - The PyTorch ResNet-18 vision classifier model (`ai-service`) is integrated in the backend pipeline. If cellular data connectivity to the AI microservice is interrupted during a scan, the mobile app automatically saves the scan to `useSyncStore` persistent offline queue and displays local quality evaluation without crashing.
