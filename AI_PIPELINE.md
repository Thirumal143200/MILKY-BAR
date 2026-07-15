# Acquisition to AI Prediction Pipeline Flow

This document maps the complete step-by-step lifecycle of a milk quality analysis, starting from the physical camera device to the final prediction output.

---

## 1. Step-by-Step Lifecycle

### Step 1: Physical Camera Frame Capture

- Camera app opens, displaying layout grid lines.
- Preview frames are parsed in real-time by UI thread worklets to verify lighting and focus scores.
- Captured frame is compressed and stored locally.

### Step 2: Quality Inspection Check

- The backend/endpoint receives the image upload.
- Checks variance of Laplacian and glare ratio values.
- Rejects instantly if quality checks fail, avoiding expensive model inference execution.

### Step 3: Enhancement Preprocessing

- CLAHE (Contrast Limited Adaptive Histogram Equalization) equalizes the luminance channel.
- Unsharp mask is applied to highlight particulate matter or spoilage texture.

### Step 4: PyTorch MobileNetV2 Inference

- Normalizes the RGB values to ImageNet parameters.
- Feeds the tensor into MobileNetV2, generating 3 raw class logits.
- Softmax calculates final class probabilities and selects the highest confidence label.

### Step 5: Explanation & DB Storage

- The model translates predicted labels to human-readable explanations.
- The server saves the prediction record under the corresponding scan entry in the database.
