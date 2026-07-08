# MilkBoy AI Models

## Architecture

The MilkBoy AI system uses a **plugin-based model architecture** that supports:

- **Model versioning** — Multiple model versions can coexist
- **Hot-swapping** — Switch between models without server restart
- **A/B testing** — Route traffic to different model versions
- **Rollback** — Instantly revert to a previous model version
- **Explainability** — Every prediction includes human-readable explanations

## Current Model: Heuristic Color Analysis (v1.0.0)

The initial model uses **color-based heuristic analysis** to classify milk quality:

### Features Extracted
| Feature | Description | Method |
|---------|-------------|--------|
| Whiteness | Proximity to pure white | Euclidean distance in RGB |
| Saturation | Color intensity | HSV conversion |
| Brightness | Overall luminance | Weighted RGB mean |
| Yellowness | Yellow tint level | R+G mean vs B |
| Color Uniformity | Consistency across sample | Standard deviation |

### Quality Categories
| Label | Description | Visual Indicators |
|-------|-------------|-------------------|
| Excellent | Premium quality | High whiteness, low saturation, uniform |
| Good | Standard quality | Good whiteness, slight cream tint |
| Acceptable | Meets minimum standards | Moderate whiteness |
| Poor | Below standards | Low whiteness, high variance |
| Adulterated | Suspected tampering | High saturation, unusual colors |
| Spoiled | Unsafe for consumption | Dark, high saturation |
| Inconclusive | Cannot determine | Unusual features, low confidence |

## Upgrading to CNN Model

To upgrade to a proper CNN model:

1. **Train** a model using TensorFlow/PyTorch in Python with labeled milk images
2. **Convert** to TensorFlow.js format:
   ```bash
   tensorflowjs_converter --input_format=tf_saved_model /path/to/model /path/to/tfjs_model
   ```
3. **Place** the converted model files in `ai/models/milk-quality-v2/`
4. **Register** the new version via the Admin API:
   ```bash
   POST /api/v1/admin/ai-models
   ```
5. **Set as default** via the Admin portal

The inference service will automatically load and use the new model.

## Model Files

Model files (`.bin`, `.pb`, `.h5`) are excluded from Git via `.gitignore`.
Only `model.json` metadata files are tracked.

## Directory Structure

```
ai/
├── models/
│   └── milk-quality-v1/
│       └── model.json          # Model metadata
├── training/
│   └── README.md               # Training documentation
└── README.md                   # This file
```
