# Production Model Deployment & MLOps Guide

## Architecture Deployment Topology

The AI service runs as an isolated microservice containerized via Docker (`ai_service/Dockerfile`) listening on port `8000`.

---

## 1. Containerization & Docker Setup

`ai_service/Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run container:

```bash
docker build -t milkboy-ai ./ai_service
docker run -d -p 8000:8000 --name milkboy-ai-container milkboy-ai
```

---

## 2. Model Metadata Verification Endpoint

The Super Admin Dashboard monitors active model deployment status by querying `GET /api/v1/ai/model-status`:

```json
{
  "status": "success",
  "data": {
    "activeModel": "milk-quality-mobilenetv2",
    "version": "v1.0.0-prod",
    "accuracy": 0.9556,
    "framework": "PyTorch 2.x",
    "datasetVersion": "milk-quality-v1 (300 samples, seed=42)",
    "statusBanner": "Pipeline Ready – MobileNetV2 Active"
  }
}
```
