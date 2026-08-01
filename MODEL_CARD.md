# Model Card — MilkBoy Quality Classifier (ResNet-18 Vision)

**Model Version**: `v1.2.0`  
**Model Type**: Deep Convolutional Neural Network (Transfer Learning via ResNet-18)  
**Framework**: PyTorch 2.2 / TorchScript Export  
**Task**: 4-Class Milk Quality Categorization & Anomaly Detection

---

## 1. Model Overview

The MilkBoy Quality Classifier evaluates spectral and visual images of milk samples to determine physical composition, freshness, and microbiological safety.

### Target Classes:

1. `NORMAL`: Standard high-grade raw milk meeting fat & protein threshold specs.
2. `MASTITIS`: Somatic cell count elevation indicating bovine sub-clinical/clinical mastitis infection.
3. `WATERED`: Adulteration with added water resulting in lowered specific gravity.
4. `CONTAMINATED`: Presence of chemical detergents, coliforms, or foreign particulates.

---

## 2. Technical Specifications

- **Input Resolution**: `224x224x3` RGB image
- **Preprocessing**: Normalized with ImageNet mean `[0.485, 0.456, 0.406]` and std `[0.229, 0.224, 0.225]`
- **Inference Runtime**: TorchScript CPU / CUDA (`< 45ms` mean latency)
- **Model Parameters**: 11.17 Million parameters
- **Output**: 4-class softmax probability distribution + Quality Score `(0-100)`

---

## 3. Training & Evaluation Summary

- **Training Epochs**: 50 epochs with Early Stopping (Patience 7)
- **Optimizer**: AdamW (`lr=1e-4`, `weight_decay=1e-2`)
- **Loss Function**: Focal Loss ($\gamma=2.0$) to handle class imbalance
- **Overall Accuracy**: **98.4%**
- **Macro F1 Score**: **98.3%**
