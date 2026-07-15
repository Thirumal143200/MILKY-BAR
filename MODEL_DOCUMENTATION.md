# Neural Network Model & Training Guide

This document describes the neural network layers, transfer learning parameters, and hyperparameters of the MilkBoy milk quality classifier.

---

## 1. Network Architecture

We utilize **MobileNetV2** as the core feature extractor due to its lightweight parameter size, low inference latency on edge/mobile devices, and high accuracy:

- **Base Layers**: MobileNetV2 features inverted residual blocks and bottleneck layers.
- **Adapted Head**: The default ImageNet head is replaced with:
  - Dropout layer (p = 0.2)
  - Fully Connected Linear layer (in_features=1280, out_features=512)
  - ReLU activation
  - Dropout layer (p = 0.2)
  - Fully Connected Linear layer (in_features=512, out_features=3) -> `["good", "spoiled", "adulterated"]`

---

## 2. Hyperparameters

Training pipeline is configured with the following defaults:

- **Optimizer**: AdamW (Learning Rate = `1e-4`, weight decay = `1e-2`)
- **Loss Function**: CrossEntropyLoss
- **Batch Size**: 32
- **Epochs**: 10 (with early stopping after 3 epochs of validation loss stagnation)
- **Target Metrics**: Maximize validation accuracy and F1 score.
- **Export Targets**: TorchScript (.pt) and ONNX formats.
