# MilkBoy AI Model Training & Fine-Tuning Guide

## Overview

This guide details the step-by-step procedure to train, fine-tune, evaluate, and export PyTorch computer vision classification models for MilkBoy.

---

## 1. Environment Setup

Ensure Python 3.10+ and required dependencies are installed:

```bash
cd ai_service
pip install -r requirements.txt
```

`requirements.txt` dependencies:

- `torch >= 2.0.0`
- `torchvision >= 0.15.0`
- `pillow >= 9.0.0`
- `numpy >= 1.22.0`
- `fastapi >= 0.100.0`
- `scikit-learn >= 1.2.0`

---

## 2. Running Training Pipeline

To train the production MobileNetV2 model with 300 synthetic images and seed 42:

```bash
python train.py --synthetic --num_synthetic 300 --epochs 10 --batch_size 32 --lr 0.0001
```

### Command Arguments

- `--data_dir`: Directory path containing train/val/test folders (default: `dataset`).
- `--synthetic`: Automatically generates balanced 3-class images if no dataset exists.
- `--epochs`: Number of training epochs (default: `10`).
- `--batch_size`: Batch size (default: `32`).
- `--lr`: Initial learning rate for AdamW optimizer (default: `1e-4`).
- `--num_synthetic`: Total synthetic sample count (default: `300`).

---

## 3. Model Output Artifacts

Training generates model artifacts under `models/milk-quality-v1/`:

- `best_model.pt`: Full PyTorch model state dictionary.
- `model.json`: Model version metadata, label mapping, and evaluation metrics.
