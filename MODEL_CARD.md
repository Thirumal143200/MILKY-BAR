# Model Card: MilkBoy Quality MobileNetV2 Architecture

## Model Overview

- **Model Name**: MilkBoy MobileNetV2 Milk Quality Classifier (`milk-quality-mobilenetv2`)
- **Architecture**: MobileNetV2 with Inverted Residual Blocks & Linear Bottlenecks
- **Framework**: PyTorch 2.x / TorchVision
- **Input Dimensions**: 3 × 224 × 224 RGB image
- **Output**: 3-class probability distribution (`fresh`, `spoiled`, `adulterated`) via Softmax
- **Parameters**: 2,227,459 trainable parameters
- **Model Size**: 8.9 MB (`.pt` PyTorch weight artifact)

---

## Intended Use

- **Primary Application**: Edge-compatible real-time milk quality assessment for dairy farmers, collection centers, and consumer mobile devices.
- **Out of Scope Applications**: Diagnostic medical imaging, chemical laboratory spectroscopy replacing accredited laboratory instruments.

---

## Performance Summary across Candidate Architectures

Empirical evaluation results across candidate architectures evaluated on the testing split (45 images, 15 per class):

| Architecture               | Parameters | Model Size |  Accuracy  | Precision  |   Recall   |  F1 Score  | CPU Latency (p95) |
| :------------------------- | :--------: | :--------: | :--------: | :--------: | :--------: | :--------: | :---------------: |
| **MobileNetV2 (Selected)** |  **2.2M**  | **8.9 MB** | **95.56%** | **95.83%** | **95.56%** | **95.60%** |    **18.4 ms**    |
| MobileNetV3-Small          |    1.5M    |   6.2 MB   |   93.33%   |   93.75%   |   93.33%   |   93.42%   |      14.2 ms      |
| ResNet18                   |   11.7M    |  44.7 MB   |   95.56%   |   96.00%   |   95.56%   |   95.65%   |      42.1 ms      |
| EfficientNet-B0            |    5.3M    |  20.4 MB   |   93.33%   |   93.90%   |   93.33%   |   93.48%   |      35.8 ms      |

### Why MobileNetV2 Was Selected

1. **Optimal Latency-Accuracy Trade-off**: Achieved 95.56% accuracy while executing in sub-20ms latency on edge CPU devices.
2. **Compact Footprint**: 8.9 MB binary size allows seamless mobile app bundling and rapid Docker container cold-starts.
3. **Low Peak Memory Footprint**: Requires less than 45 MB RAM during active inference.
