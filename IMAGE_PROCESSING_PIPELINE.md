# Computer Vision Image Preprocessing Pipeline

This document describes the step-by-step image enhancement and correction pipeline executed on captured milk samples before they are submitted to the AI analysis endpoints.

---

## 1. Pipeline Stages

```
Raw Capture
    │
    ▼
Histogram Equalization (Normalizes contrast across sample surface)
    │
    ▼
Laplacian Edge Detection (Highlights container contours)
    │
    ▼
White Balance Normalization (Filters out yellow/warm indoor light cast)
    │
    ▼
Crop & Perspective Correction (Removes background objects)
    │
    ▼
Enhanced Image Output (Sent to AI Prediction APIs)
```

---

## 2. Enhancement Details

1. **Histogram Equalization**: Distributes intensity values across the global sample area, making features visible under poor or direct lighting.
2. **Edge Detection**: A Laplacian edge operator highlights container walls to verify proper sample alignment.
3. **White Balance Temp Normalization**: Removes ambient color shifts, ensuring the neural network evaluates the true color of the milk rather than the room light cast.
4. **Resolution Optimizations**: Downsamples images to 600x600 pixels using high-quality bicubic interpolation to minimize upload payload size while preserving fat globule textures.
