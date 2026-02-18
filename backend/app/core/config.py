"""
Configuration management for the application.
Handles environment variables and application settings.
"""
from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import Optional, Union


def _parse_cors_origins(v: Union[str, list]) -> list[str]:
    if isinstance(v, list):
        return v
    if isinstance(v, str):
        return [x.strip() for x in v.split(",") if x.strip()]
    return ["http://localhost:3000", "http://localhost:3001"]


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "Nexus API"
    APP_VERSION: str = "1.1.0"
    DEBUG: bool = False
    
    # Database (PostgreSQL)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/personalfinance"
    AUTO_CREATE_DB: bool = False  # Set True in dev to create tables on startup
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS: set CORS_ORIGINS in production (comma-separated: https://app.com,https://www.app.com)
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # API
    API_V1_STR: str = "/api/v1"
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, list]) -> list[str]:
        return _parse_cors_origins(v) if v is not None else ["http://localhost:3000", "http://localhost:3001"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

