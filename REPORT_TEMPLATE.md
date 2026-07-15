# MilkBoy Quality Analysis Report Template

This template outlines the visual layout structure, typography, and styling parameters applied during PDF and HTML report generation.

---

## 1. Visual Hierarchy & Grid Layout

### Header Block

- **Brand Name**: 🥛 MilkBoy (FontSize: 24pt, Color: `#1a1a2e` - Navy)
- **Title**: Milk Quality Analysis Report (FontSize: 14pt, Color: `#4a4a6a` - Slate Blue)
- **Border Divider**: 1pt thickness solid border line (`#e0e0e0`)

### Metadata Column (Left-Aligned)

- **Report ID**: `[UUID]`
- **Scan ID**: `[UUID]`
- **Timestamp**: `[Date String]`
- **Analyst Name**: `[User First/Last]`

---

## 2. Assessment Summary Block

- **Overall Grade/Label**: `EXCELLENT` | `GOOD` | `ACCEPTABLE` | `POOR` | `ADULTERATED` | `SPOILED`
  - Font Size: 28pt (Bold)
  - Color Encoding:
    - Good/Excellent: `#2e7d32` (Green)
    - Acceptable/Poor: `#ef6c00` (Orange)
    - Spoiled/Adulterated: `#c62828` (Red)
- **Confidence Rating**: `[Percent]%`
- **Breakdown Bars**:
  - Width: Relative to probability (0 - 200pt).
  - Colors matched dynamically to quality classes.

---

## 3. QR Certification Footer

- **QR Code Placement**: Center-aligned, 100x100 pixels.
- **Verification text**: "Scan QR code to view this report online".
- **Disclaimer Note**: "Results are based on visual image analysis and should be confirmed by laboratory testing".
- **Copyright Label**: "© 2026 MilkBoy. All rights reserved."
