# Enterprise Notification System Architecture

This document describes the design, components, event dispatcher model, role-based broadcasting, and preference filtering strategy of the **MilkBoy Enterprise Notification System**.

---

## 1. Architectural Overview

```
                          ┌─────────────────────────────┐
                          │     Application Events      │
                          │ (Auth, Scan, Report, Sync,  │
                          │   Laboratory, Admin, etc.)  │
                          └──────────────┬──────────────┘
                                         │
                                         ▼
                          ┌─────────────────────────────┐
                          │   NotificationDispatcher    │
                          │    (Node.js EventEmitter)   │
                          └──────────────┬──────────────┘
                                         │
                                         ▼
                          ┌─────────────────────────────┐
                          │    NotificationsService     │
                          │  (Quiet Hours & Category    │
                          │   Preferences Validation)   │
                          └──────────────┬──────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            ▼                            ▼                            ▼
┌───────────────────────┐    ┌───────────────────────┐    ┌───────────────────────┐
│     In-App Store      │    │  Push Token Delivery  │    │  Local Notification   │
│  (DB 'notifications') │    │  (FCM / Device Token) │    │  (Mobile Banner Alert)│
└───────────────────────┘    └───────────────────────┘    └───────────────────────┘
```

---

## 2. Core Components

1. **`notificationDispatcher` ([notificationDispatcher.ts](file:///c:/Users/thiru/Downloads/MILK%20BOY/server/src/services/notifications/notificationDispatcher.ts))**:
   - Centralized EventEmitter listening to system activity.
   - Categorizes events automatically (`auth`, `scan`, `report`, `sync`, `laboratory`, `admin`, `system`).
   - Supports both single-user targeting (`userId`) and multi-user role broadcasting (`role`).

2. **`NotificationsService` ([notifications.service.ts](file:///c:/Users/thiru/Downloads/MILK%20BOY/server/src/modules/notifications/notifications.service.ts))**:
   - Validates user notification preferences before persisting or dispatching alerts.
   - Enforces master toggles (`enableNotifications`), category toggles (`categories[category]`), and quiet hours boundaries (`quietHours`).
   - Implements role-based query broadcasting across `roles` and `users` tables.
   - Manages device push tokens in `user_devices` table.

3. **Client Notification Center ([NotificationsScreen.tsx](file:///c:/Users/thiru/Downloads/MILK%20BOY/mobile/src/screens/NotificationsScreen.tsx))**:
   - Zustand-driven state store ([notificationStore.ts](file:///c:/Users/thiru/Downloads/MILK%20BOY/mobile/src/store/notificationStore.ts)).
   - Supports live category tabs, search filtering, read/unread counters, and bulk clear operations.
