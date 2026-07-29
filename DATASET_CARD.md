# Dataset Card: MilkBoy Quality Classification Dataset

## Dataset Overview

The **MilkBoy Quality Classification Dataset** is a curated computer vision dataset designed for automated quality assessment, adulteration detection, and spoilage classification of raw and processed milk samples.

---

## Dataset Details

- **Dataset Name**: MilkBoy Quality Classification Dataset (`milk-quality-v1`)
- **Primary Task**: Multi-Class Image Classification
- **Classes (3)**:
  1. `fresh`: High-quality, uncontaminated fresh milk (optimal color, normal viscosity).
  2. `spoiled`: Aged or curdled milk exhibiting phase separation, clumping, or souring.
  3. `adulterated`: Water-diluted or chemically contaminated milk (altered reflectance/color hue).
- **Total Samples**: 300 images (100 samples per class)
- **Image Resolution**: 224 × 224 pixels (RGB, 3 channels)
- **Format**: JPEG / PNG
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0)

---

## Dataset Split & Reproducibility

Splits were generated using a fixed random seed (`seed=42`) to guarantee 100% reproducible training, validation, and testing partitions.

| Partition      | Percentage | Sample Count | `fresh` | `spoiled` | `adulterated` |
| :------------- | :--------: | :----------: | :-----: | :-------: | :-----------: |
| **Training**   |    70%     |     210      |   70    |    70     |      70       |
| **Validation** |    15%     |      45      |   15    |    15     |      15       |
| **Testing**    |    15%     |      45      |   15    |    15     |      15       |
| **Total**      |  **100%**  |   **300**    | **100** |  **100**  |    **100**    |

---

## Data Preprocessing & Integrity Checks

### Integrity & Quality Controls

1. **Corrupted Image Filtering**: MD5 hash & image header verification; zero unreadable images.
2. **Duplicate Detection**: Perceptual hashing (`ImageHash`) eliminated duplicate frames.
3. **Label Consistency**: Verified via cross-validation and laboratory fat/pH measurement cross-referencing.

### Preprocessing Pipeline

- **Resize**: Rescaled to 224 × 224 using bilinear interpolation.
- **Normalization**: ImageNet RGB mean `[0.485, 0.456, 0.406]` and standard deviation `[0.229, 0.224, 0.225]`.
- **Denoising**: Bilateral filter smoothing (`d=5, sigmaColor=75, sigmaSpace=75`).
- **White Balance**: Automatic gray-world color constancy correction.

### Augmentations Applied (Training Split Only)

- Random Horizontal & Vertical Flips ($p=0.5$)
- Random Rotation ($\pm 30^\circ$)
- Color Jitter (Brightness $\pm 20\%$, Contrast $\pm 20\%$, Gamma $0.8 - 1.2$)
- Random Gaussian Blur ($\sigma \in [0.1, 2.0]$)
