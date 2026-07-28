# 🔄 Sync Worker Engine Documentation

## Component Overview
The `SyncWorker` engine (`mobile/src/services/syncWorker.ts`) manages offline scan payload transmission between mobile clients and the MilkBoy API server.

---

## Retries & Exponential Backoff Specification

When an upload attempt fails due to a network interruption or server timeout, `SyncWorker` calculates an exponential backoff delay with random jitter to prevent thundering herd traffic:

$$\text{Delay} = \min\left(\text{MAX\_DELAY}, \text{BASE\_DELAY} \times 2^{\text{retryCount}} + \text{random}(0, \text{JITTER})\right)$$

### Backoff Delay Parameters
- `BASE_DELAY`: $1000 \text{ ms}$ (1 second)
- `MAX_DELAY`: $60000 \text{ ms}$ (60 seconds)
- `JITTER`: $500 \text{ ms}$
- `MAX_RETRIES`: 5 attempts before scan is marked as permanently failed requiring manual user retry.

### Exponential Schedule Example
- **Attempt 0**: Immediate
- **Attempt 1**: $\sim 2.0 - 2.5 \text{ seconds}$
- **Attempt 2**: $\sim 4.0 - 4.5 \text{ seconds}$
- **Attempt 3**: $\sim 8.0 - 8.5 \text{ seconds}$
- **Attempt 4**: $\sim 16.0 - 16.5 \text{ seconds}$
- **Attempt 5**: $\sim 32.0 - 32.5 \text{ seconds}$

---

## Batch Payload Protocol

### Request Payload (`POST /api/v1/scans/batch-sync`)
```json
{
  "scans": [
    {
      "clientScanId": "client-uuid-001",
      "timestamp": 1722180000000,
      "title": "Morning Batch Milk Sample",
      "notes": "Farm A - Tank 3",
      "location": {
        "latitude": 12.9716,
        "longitude": 77.5946
      },
      "imageData": {
        "filename": "sample_001.jpg",
        "mimeType": "image/jpeg",
        "base64Data": "...base64_encoded_string..."
      }
    }
  ]
}
```

### Server Response Payload
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Batch synchronization processed successfully.",
  "data": {
    "syncedCount": 1,
    "duplicateCount": 0,
    "failedCount": 0,
    "totalProcessed": 1,
    "results": [
      {
        "clientScanId": "client-uuid-001",
        "serverId": "550e8400-e29b-41d4-a716-446655440000",
        "status": "synced",
        "scanResult": {
          "scan": { "id": "550e8400-e29b-41d4-a716-446655440000", "status": "completed" },
          "predictions": [{ "qualityLabel": "good", "confidence": 0.94 }]
        }
      }
    ]
  }
}
```
