# Camera System Architecture & Specifications

This document specifies the technical details of the camera integration inside the MilkBoy React Native application.

---

## 1. Device Integration & Permissions

We utilize `react-native-vision-camera` (v4.6.1) to communicate directly with native Android Camera2 APIs:

- **Permissions**: Programmatic checks verify `Camera.requestCameraPermission()` on startup.
- **Auto Focus**: Employs continuous video autofocus (`focusMode: "continuous"`) by default.
- **Auto Exposure**: Managed by native hardware modules with optional manual zoom compensation.
- **HDR support**: Configured dynamically based on format selection (`hdr: true` when device format supports it).

---

## 2. Controls & Overlays

- **3x3 Grid Overlay**: Renders layout lines to guide users to align the milk container cup in the center.
- **Camera Flip**: Supports switching between back and front camera modules.
- **Flash Control**: Supports cycle toggling (`off` -> `on` -> `auto`).
- **Zoom Slider**: Touch gestures map to `zoom` parameter on the Vision Camera component (1x to 5x).
- **Focus Indicator Box**: Shows a targeted border in the center of the viewport to indicate standard focus lock coordinates.
