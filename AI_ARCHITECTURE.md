# Artificial Intelligence & Prediction System Architecture

This document describes the model deployment architecture, interface schema, and validation layers of the MilkBoy AI service.

---

## 1. System Block Diagram

```
Processed Image (600x600)
    │
    ▼
FastAPI endpoint: POST /api/v1/analyze
    │
    ├─► OpenCV Quality Check (Laplacian Blur & Glare)
    │
    ▼ (If passed)
Image Preprocessor (Resized to 256, center cropped to 224x224, Normalized)
    │
    ▼
PyTorch Model Inference (MobileNetV2 classifier head)
    │
    ▼
Softmax Layer (Calculates label probabilities)
    │
    ▼
JSON Output: { label, confidence, explanation, issues }
```

---

## 2. API Schema

### `POST /api/v1/analyze`

- **Request**: Multipart Form Data containing the image file.
- **Response**:
  ```json
  {
    "is_accepted": true,
    "label": "good",
    "confidence": 0.9854,
    "explanation": "Clear consistency, optimal color and no impurities detected.",
    "issues": [],
    "enhanced": true
  }
  ```
- **Error States**:
  - `400 Bad Request`: If the file format is not an image or if the image is corrupted.
