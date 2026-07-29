# Model Version History & Changelog

## Version History Overview

| Version           | Release Date      | Model Architecture     | Training Dataset                        |  Accuracy  |           Status           |
| :---------------- | :---------------- | :--------------------- | :-------------------------------------- | :--------: | :------------------------: |
| **`v1.0.0-prod`** | **July 29, 2026** | **MobileNetV2**        | **MilkQuality 300 samples (seed=42)**   | **95.56%** |  🟢 **ACTIVE PRODUCTION**  |
| `v0.2.0-beta`     | July 15, 2026     | ResNet18               | Initial synthetic dataset (150 samples) |   91.20%   | 🟡 Deprecated (Large size) |
| `v0.1.0-alpha`    | July 10, 2026     | Heuristic Color Engine | Synthetic RGB rules                     |   82.00%   |     🟡 Fallback Engine     |

---

## Detailed Model Release Notes

### `v1.0.0-prod` (Current Active Version)

- **Architecture**: MobileNetV2 with ImageNet pre-trained feature extractor and fine-tuned 3-class classifier head.
- **Improvements**:
  - Reduced p95 latency from 42ms to 18.4ms.
  - Reduced model binary size from 44.7 MB to 8.9 MB.
  - Implemented AdamW optimizer with CosineAnnealingLR scheduling and early stopping.
  - Integrated into FastAPI `/api/v1/ai/predict` endpoint and Super Admin Monitoring dashboard.
