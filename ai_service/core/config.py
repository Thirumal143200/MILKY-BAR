from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MilkBoy AI Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Model configuration
    MODEL_VERSION: str = "v1-stub"
    CONFIDENCE_THRESHOLD: float = 0.85
    
    # Image processing thresholds
    BLUR_THRESHOLD: float = 100.0  # Variance of Laplacian
    BRIGHTNESS_LOW_THRESHOLD: float = 40.0
    BRIGHTNESS_HIGH_THRESHOLD: float = 240.0

    class Config:
        env_file = ".env"

settings = Settings()
