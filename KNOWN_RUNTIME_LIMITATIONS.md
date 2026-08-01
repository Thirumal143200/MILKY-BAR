# MilkBoy Enterprise Platform — Known Runtime Limitations

## Overview
This document documents operational considerations and hardware requirements for the MilkBoy Android Application v1.0.0.

---

## 1. Camera & Optical Pre-checks
- **Hardware Requirement**: Physical Android device with autofocus camera required for live optical quality checks.
- **Lighting & Contrast**:
  - Image brightness below 15% triggers a "Too Dark" pre-analysis warning.
  - Image glare ratio above 5% triggers an "Overexposed" pre-analysis warning.
  - Laplacian variance below 100 triggers a "Blurry Image" prompt to retake photo.

---

## 2. AI Inference Engine
- **Model Architecture**: PyTorch MobileNetV2 with dynamic fallback loader.
- **Inference Mode**: Server-side FastAPI inference endpoint `/api/v1/analyze` for maximum precision.
- **Offline Fallback**: When offline, scans are queued locally and automatically processed upon reconnecting to the backend.

---

## 3. Storage & Synchronization
- **Zustand Storage**: Uses `@react-native-async-storage/async-storage` for queue persistence.
- **Recommended Queue Capacity**: Up to 500 offline scans before executing batch sync.
