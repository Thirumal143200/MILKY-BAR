# Notification System API Reference

This document provides technical specifications for all REST endpoints exposed by the **MilkBoy Notification System**.

Base URL: `/api/v1/notifications`

---

## 1. Endpoints Overview

| Method   | Endpoint       | Description                                                                | Auth Required | Permission             |
| :------- | :------------- | :------------------------------------------------------------------------- | :------------ | :--------------------- |
| `GET`    | `/`            | List paginated notifications (supports `category`, `search`, `unreadOnly`) | Yes           | `notifications:read`   |
| `GET`    | `/unread`      | Retrieve unread notifications and total unread count                       | Yes           | `notifications:read`   |
| `PUT`    | `/read`        | Mark a notification as read                                                | Yes           | `notifications:update` |
| `PUT`    | `/:id/read`    | Mark single notification as read                                           | Yes           | `notifications:update` |
| `PATCH`  | `/:id/read`    | Alias to mark single notification as read                                  | Yes           | `notifications:update` |
| `PUT`    | `/read-all`    | Mark all notifications as read for current user                            | Yes           | `notifications:update` |
| `POST`   | `/read-all`    | Alias to mark all notifications as read                                    | Yes           | `notifications:update` |
| `DELETE` | `/:id`         | Delete a single notification                                               | Yes           | `notifications:delete` |
| `DELETE` | `/`            | Clear all notifications for current user                                   | Yes           | `notifications:delete` |
| `GET`    | `/preferences` | Retrieve user notification preference settings                             | Yes           | `notifications:read`   |
| `PUT`    | `/preferences` | Update user notification preference settings                               | Yes           | `notifications:update` |
| `POST`   | `/tokens`      | Register a device push notification token                                  | Yes           | `notifications:update` |

---

## 2. Sample Payloads & Responses

### 2.1 Register Device Push Token (`POST /api/v1/notifications/tokens`)

**Request Payload:**

```json
{
  "token": "fcm_eKx92jL0PqZ:APA91bH...",
  "deviceType": "android",
  "deviceName": "Pixel 8 Pro"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "device-uuid-1234",
    "userId": "user-uuid-5678",
    "deviceName": "Pixel 8 Pro",
    "deviceType": "android",
    "pushToken": "fcm_eKx92jL0PqZ:APA91bH...",
    "lastActiveAt": "2026-07-28T17:35:31.000Z"
  },
  "message": "Push token registered successfully."
}
```

### 2.2 Update Preferences (`PUT /api/v1/notifications/preferences`)

**Request Payload:**

```json
{
  "enableNotifications": true,
  "enablePush": true,
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "07:00"
  },
  "categories": {
    "scan": true,
    "report": true,
    "sync": true,
    "laboratory": true,
    "admin": false
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "enableNotifications": true,
    "enablePush": true,
    "enableLocal": true,
    "enableEmail": true,
    "enableSms": false,
    "soundEnabled": true,
    "vibrationEnabled": true,
    "priorityThreshold": "low",
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "07:00"
    },
    "categories": {
      "auth": true,
      "scan": true,
      "report": true,
      "sync": true,
      "laboratory": true,
      "admin": false,
      "system": true
    }
  },
  "message": "Notification preferences updated successfully."
}
```
