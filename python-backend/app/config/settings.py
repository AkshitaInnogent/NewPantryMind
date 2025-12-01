# app/config/settings.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Server Configuration
    app_name: str = "PantryMind OCR AI Service"
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = False
    
    # OpenRouter Configuration
    openrouter_api_key: str
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    
    # Model Selection
    ocr_model: str = "qwen/qwen3-4b:free"
    vision_model: str = "x-ai/grok-4.1-fast:free"
    
    # OCR Configuration
    max_image_size_mb: int = 10
    supported_formats: list = ["jpg", "jpeg", "png", "webp"]
    
    # Request Timeouts
    llm_timeout_seconds: int = 30
    ocr_timeout_seconds: int = 15
    
    # Java Backend Integration
    java_backend_url: Optional[str] = None
    api_key_header: str = "X-API-Key"
    internal_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
