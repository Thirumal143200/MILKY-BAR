# Dataset Card — MilkBoy Multi-Spectral Quality Dataset (MB-MSQD v1.0)

**Dataset ID**: `MB-MSQD-2026-V1`  
**Total Samples**: 10,000 High-Resolution Sample Images  
**Collection Range**: January 2025 – June 2026  
**Source**: Partner Dairy Farms & Certified Regional Milk Testing Laboratories

---

## 1. Dataset Breakdown

| Class Label      | Training Set (70%) | Validation Set (15%) | Test Set (15%) | Total Samples |
| :--------------- | :----------------- | :------------------- | :------------- | :------------ |
| **NORMAL**       | 3,500              | 750                  | 750            | **5,000**     |
| **MASTITIS**     | 1,400              | 300                  | 300            | **2,000**     |
| **WATERED**      | 1,050              | 225                  | 225            | **1,500**     |
| **CONTAMINATED** | 1,050              | 225                  | 225            | **1,500**     |
| **TOTAL**        | **7,000**          | **1,500**            | **1,500**      | **10,000**    |

---

## 2. Lab Verification Protocol

Every image sample was paired with ground-truth laboratory test results:

- **Fat % & SNF %**: Ultrasonic Milk Analyzer (Lactoscan SP)
- **Somatic Cell Count (SCC)**: Automated Fluorescent Microscopic Counter
- **Adulteration Tests**: Specific Gravity Hydrometer & Electrical Conductivity Sensors
