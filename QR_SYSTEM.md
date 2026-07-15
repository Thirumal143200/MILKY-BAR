# QR Code Generation & Verification System

This document specifies the technical design, scanning workflow, and verification checkpoints of the MilkBoy QR system.

---

## 1. QR Code Specifications

- **Format**: PNG image.
- **Generator Module**: `qrcode` (node module).
- **Data Content**: Absolute HTTP URL pointing to the verification page:
  - Format: `https://milkboy.com/verify/report/:reportId`
- **Resolution**: 200x200 pixels.
- **Visual Design**: Dark blue blocks (`#1a1a2e`) on pure white background (`#ffffff`).

---

## 2. Verification Flow

1. **User Scans QR Code**:
   - The user opens their phone camera or any scanner.
   - Triggers routing request to `/api/v1/reports/verify/:id`.
2. **Server Check**:
   - Queries database `reports` table to match report ID.
   - Resolves corresponding scan predictions, user credentials, and image quality metrics.
3. **Response Payload**:
   - Returns a structured verification card with a certified green check badge.
   - Displays all verification fields:
     - Scan ID
     - User
     - Milk Quality
     - Confidence
     - Timestamp
     - AI Model Version
     - Image Quality Score
