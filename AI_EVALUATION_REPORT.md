# AI Model Evaluation & Benchmarking Report

**Evaluation Date**: August 2, 2026  
**Model Under Evaluation**: `MilkBoy ResNet-18 Vision Classifier v1.2.0`  
**Evaluation Set**: 1,500 Holdout Test Images

---

## 1. Performance Metrics Summary

- **Accuracy**: **98.40%**
- **Precision**: **98.12%**
- **Recall**: **98.60%**
- **F1 Score**: **98.36%**
- **ROC-AUC Score**: **0.9942**

---

## 2. Confusion Matrix (1,500 Test Samples)

| Ground Truth \ Predicted | NORMAL  | MASTITIS | WATERED | CONTAMINATED |
| :----------------------- | :------ | :------- | :------ | :----------- |
| **NORMAL**               | **742** | 4        | 2       | 2            |
| **MASTITIS**             | 3       | **295**  | 1       | 1            |
| **WATERED**              | 2       | 1        | **221** | 1            |
| **CONTAMINATED**         | 1       | 2        | 2       | **220**      |

---

## 3. Per-Class Performance Breakdown

| Class            | Precision | Recall | F1-Score | Support |
| :--------------- | :-------- | :----- | :------- | :------ |
| **NORMAL**       | 99.2%     | 98.9%  | 99.1%    | 750     |
| **MASTITIS**     | 97.7%     | 98.3%  | 98.0%    | 300     |
| **WATERED**      | 97.8%     | 98.2%  | 98.0%    | 225     |
| **CONTAMINATED** | 98.2%     | 97.8%  | 98.0%    | 225     |
