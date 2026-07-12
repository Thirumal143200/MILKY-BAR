# Camera Guidance & Quality Threshold Algorithm

This document defines the mathematical guidelines, threshold parameters, and user notification messages computed in real-time on preview frames.

---

## 1. Quality Parameter Logic

Preview frames are analyzed at 30fps using React Native Vision Camera worklets:

- **Sharpness**: Variance of Laplacian is calculated on subsampled pixels. Values `< 5` suggest significant motion blur or focus issues, triggering `"Hold Camera Steady"`.
- **Exposure**: The average intensity value (Y channel) of pixels is computed:
  - If `brightness < 50` -> Triggers `"Increase Lighting"` (Underlit).
  - If `brightness > 220` -> Triggers `"Reduce Reflection"` (Overexposed).
- **Distance**: Calculated based on the detected circular diameter of the milk cup rim:
  - `< 8cm` -> `"Move Away"`.
  - `> 25cm` -> `"Move Closer"`.

---

## 2. Quality Score Formulation

The final score is formulated as:
$$\text{Quality Score} = 100 - \Delta_{\text{exposure}} - \Delta_{\text{blur}} - \Delta_{\text{distance}} - \Delta_{\text{glare}}$$

Where:

- $\Delta_{\text{exposure}} = 30$ if lighting is underlit or overexposed.
- $\Delta_{\text{blur}} = 35$ if the frame is blurry.
- $\Delta_{\text{distance}} = 20$ if distance is outside the optimal range.
- $\Delta_{\text{glare}} = 25$ if glare is detected.

The capture button is locked unless the calculated $\text{Quality Score} \ge 60$.
