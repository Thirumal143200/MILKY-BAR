# MilkBoy Report System Specifications

This document describes the structure, APIs, and formats supported by the MilkBoy quality reporting module.

---

## 1. Features

- **PDF Generation**: Generates styled PDF files dynamically with embeddable metadata and custom colors.
- **Export Capabilities**: Supports exporting multiple report indexes as:
  - **CSV**: Plain comma-delimited columns.
  - **Excel**: Standard XML workbook format for spreadsheets.
- **Report Sharing**: Secure sharing tokens that expire in 7 days.
- **Report Verification**: Built-in verification checklist to prevent tempering.
- **Search & Filters**: Enables searching scans by title or filtering by scan status (`completed`, `pending`, `failed`).

---

## 2. API Endpoint Manifest

- `POST /api/v1/reports/generate/:scanId` - Generate a PDF report for a finished scan.
- `GET /api/v1/reports/:id/download` - Download PDF file.
- `GET /api/v1/reports/:id/preview` - Render the report as HTML inside browser frames.
- `GET /api/v1/reports/export/csv` - Download CSV summary data sheet.
- `GET /api/v1/reports/export/excel` - Download Excel worksheet summary sheet.
- `POST /api/v1/reports/:id/share` - Create secure sharing links.
- `GET /api/v1/reports/verify/:id` - Verify QR code link integrity.
