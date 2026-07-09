# MilkBoy AI Service

Python-based microservice and training pipeline for the Milk Quality computer vision models.

## Training Pipeline

The AI service comes with a robust synthetic data generator and PyTorch training loop to fine-tune a MobileNetV2 architecture.

### Setup

1. `pip install -r requirements.txt`
2. Run with dummy data to test pipeline: `python train.py --epochs 5 --synthetic`
3. Or point to real dataset: `python train.py --data_dir /path/to/data`

## Edge ML Preprocessing

Images captured from the mobile client are preprocessed before inference.

- **Blur Detection**: Variance of Laplacian.
- **Glare Detection**: Vectorized brightness masking.
- **CLAHE**: Contrast Limited Adaptive Histogram Equalization to normalize poor farm lighting.
