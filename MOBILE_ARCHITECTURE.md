# Mobile Architecture Guide

This document describes the architectural patterns, state management design, caching strategy, and offline storage policies of the MilkBoy React Native application.

---

## 1. Directory Structure

```
mobile/
├── App.tsx                     # Entry point & Protected Stack Router
├── global.css                  # Tailwinds style setup
├── src/
│   ├── api/
│   │   └── client.ts           # Axios configuration, interceptors, and file uploads
│   ├── components/             # Reusable UI widgets
│   ├── screens/                # Native screen modules
│   └── store/                  # Zustand stores (Auth, Scan, Notifications, Sync)
```

---

## 2. State Management & Data Flows

We utilize **Zustand** for state stores:
- **useAuthStore**: Handles session state, token persistence, and role-based permissions filtering.
- **useScanStore**: Manages current scan captures, uploads queue, and prediction results.
- **useNotificationStore**: Manages notifications list and user configurations.
- **useSyncStore**: Caches scan images captured offline in a SQLite persist-backed queue for background sync when the network returns.

---

## 3. Caching & Storage Policy

- **Token Storage**: JWT access and refresh tokens are stored in secure local storage using `@react-native-async-storage/async-storage`.
- **Offline Scanning Queue**: Images captured in remote areas are persisted with metadata and retry state indicators, synced via background upload synchronization tasks.
