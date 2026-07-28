import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routes import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS — restrict origins in production via CORS_ORIGINS env var
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:4000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "version": settings.VERSION}

@app.get("/liveness")
@app.get("/api/v1/liveness")
def liveness_check():
    return {"status": "alive", "service": "milkboy-ai"}

@app.get("/readiness")
@app.get("/api/v1/readiness")
def readiness_check():
    return {"status": "ready", "service": "milkboy-ai", "model": "MobileNetV2"}

app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
