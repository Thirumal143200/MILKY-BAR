# Labeled Dataset Status & Pipeline

This document describes the dataset status, validation protocols, splits, and augmentation policies of the MilkBoy AI system.

---

## 1. Dataset Status Summary

> [!WARNING]
> **Real Labeled Dataset Status**: **Unavailable**
>
> - The production image pipeline is fully integrated and tested.
> - Awaiting real labeled milk sample images from laboratory field tests.
> - A custom OpenCV-based synthetic image generator is provided in the repository (`ai_service/train/dataset.py`) to verify pipeline functionality.

---

## 2. Dataset Pipeline Specifications

When real labeled data becomes available, the following pipeline stages must be triggered:

### 2.1 Quality Filtering & De-duplication

- Remove duplicates via image MD5 hashes.
- Filter out out-of-focus or underlit pictures using Laplacian variance and brightness filters.

### 2.2 Dataset Split Ratios

- **Train**: 80% (for updating weight weights parameters)
- **Validation**: 10% (for early stopping validation)
- **Test**: 10% (for final model evaluation and scoring metrics)

### 2.3 Image Augmentations

To prevent overfitting on the MobileNetV2 architecture, the pipeline applies:

- Random horizontal/vertical flips.
- Random rotations up to 15 degrees.
- Color jitter (adjusting brightness, contrast, and saturation by 30%).
- Center cropping to 224x224 input shape.
