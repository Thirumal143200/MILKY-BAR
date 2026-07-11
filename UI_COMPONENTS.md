# Reusable UI Components & Style Tokens

This document indexes the design guidelines, styles, and reusable custom components implemented inside the MilkBoy React Native application.

---

## 1. Design System Tokens

- **Material 3 Palette**: Fits modern light/dark styles:
  - Background (Light: `#ffffff`, Dark: `#111827`)
  - Primary (Light: `#2563eb` - Blue 600, Dark: `#3b82f6` - Blue 500)
  - Success (Light/Dark: Emerald)
  - Failure/Spoiled (Light/Dark: Rose)
  - Warnings/Inconclusive (Light/Dark: Amber)
- **Typography**:
  - Headings: Bold tracking-tight typography (`font-extrabold`)
  - Subheadings/Buttons: Medium weight tracking-wide uppercase indicators (`font-bold`)
  - Body: Medium weight leading-relaxed description fields (`leading-relaxed`)

---

## 2. Reusable Component Inventory

- **UploadSyncManager**: Visual progress manager running background synchronization of offline queues.
- **TextInput**: Customized, rounded input fields with inline validators, placeholders, and secure text toggles.
- **Floating Shutter**: Camera controls containing permissions handlers, zoom triggers, focus indicators, and action redirects.
- **Badge Indicators**: Dynamic indicators changing display borders based on quality labels (`excellent`, `good`, `spoilage`).
- **Loading Skeleton**: Shimmer skeleton blocks shown during list queries and PDF report compilations.
