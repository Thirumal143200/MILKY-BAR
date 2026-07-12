# Navigation & Routing Guide

This document defines route protection policies, navigation keys, and role-based navigation rules.

---

## 1. Route Protection & Guards

Protected route lists are mounted inside the `NavigationContainer` in `App.tsx`:

- If `isAuthenticated = false`, the navigator mounts only the **Auth Stack** (Splash, Onboarding, Login, Register, ForgotPassword, ResetPassword, MfaVerification).
- If `isAuthenticated = true`, the navigator mounts only the **App Stack** (Home, Camera, Preview, Processing, Result, Reports, ReportDetails, ScanHistory, ScanDetails, Notifications, NotificationDetails, Profile, EditProfile, Settings, Security, Help, About, Privacy, Terms, Feedback).

This guarantees that unauthenticated users can never navigate to protected views.

---

## 2. Deep Linking Schema

We define the following deep links for app integration:

- `milkboy://app/home` -> Launches HomeScreen dashboard.
- `milkboy://app/scan/:id` -> Opens ScanDetailsScreen.
- `milkboy://app/report/:id` -> Opens ReportDetailsScreen.
- `milkboy://app/alert/:id` -> Opens NotificationDetailsScreen.
- `milkboy://app/reset-password?token=:token` -> Redirects straight to ResetPasswordScreen.
