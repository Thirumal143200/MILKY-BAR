# MilkBoy Enterprise Platform — Known Limitations & Operational Considerations

## Overview

This document outlines operational boundaries, hardware recommendations, and known limitations for MilkBoy Enterprise v1.0.0.

---

## 1. AI Service & PyTorch Model

- **Default Architecture**: MobileNetV2 pre-trained model with dynamic fallback.
- **Lighting & Quality Requirements**:
  - Sample images require adequate lighting (>30% mean brightness).
  - Severe blur (Laplacian variance < 100) will automatically trigger an instant quality warning before running inference to prevent false positives.
- **Custom Model Weights**:
  - Custom trained `.torchscript.pt` weights can be placed at `ai_service/models/milk-quality-v1/best_model.torchscript.pt`.

---

## 2. Mobile App & Camera

- **Permissions**: Camera permission is required for live scanning. If denied by the user, the app provides a graceful fallback prompt.
- **Offline Storage Limit**: Zustand sync queue is persistent up to device storage limits. Recommended queue limit is 500 scans before triggering batch sync.

---

## 3. Server & Database

- **Database Support**: PostgreSQL (production default) and SQLite (development/in-memory test default).
- **Concurrency**: Up to 10,000 concurrent API requests with standard rate limiting (100 requests per 15 minutes per IP).
