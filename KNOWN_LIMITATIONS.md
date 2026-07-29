# Known Technical Limitations & External Dependencies

## Transparent Disclosure of System Boundaries

While all 15 engineering modules are code-complete, hardened, and verified, the following production environment dependencies remain external to the monorepo codebase and must be fulfilled prior to public production traffic deployment:

---

## 1. AI Model Fine-Tuning Dataset

- **Status**: The PyTorch MobileNetV2 classification model (`ai_service`) is integrated, containerized, and functional with an automated fallback heuristic engine.
- **Limitation**: Final fine-tuning requires a labeled field dataset of real milk sample images collected from target production farms.
- **User Interface Indicator**: The Super Admin dashboard explicitly displays the dataset status banner: `Pipeline Ready – Awaiting Production Dataset`.

---

## 2. Push Notification Production Gateway Keys

- **Status**: Mobile app push registration (`Expo.getExpoPushTokenAsync`), backend device token mapping (`user_devices`), and EventEmitter dispatcher (`notificationDispatcher.ts`) are fully implemented.
- **Limitation**: Production FCM (Firebase Cloud Messaging) for Android and APNs (Apple Push Notification service) for iOS credentials must be configured in environment secrets (`FCM_SERVER_KEY`, `APNS_KEY`) upon production cloud deployment.

---

## 3. Remote Cloud Storage & Database Deployment

- **Status**: Local storage provider and in-memory SQLite / local PostgreSQL environments are operational with automated migrations, indexing, and CLI backup/restore scripts.
- **Limitation**: Production cloud storage (AWS S3 or GCP Cloud Storage) bucket credentials and production managed PostgreSQL instance strings (`DATABASE_URL`) must be supplied in production `.env` files.
