from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import os
from typing import List, Optional
import json

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file= ".env",
        extra="ignore",
    )

    DATABASE_URL: str 

    CLERK_JWKS_URL: str 
    CLERK_ISSUER: str 
    CLERK_AUDIENCE: Optional[str] = None

    CORS_ORIGINS: List[str] = []

    

settings = Settings()

if not settings.DATABASE_URL or "://" not in settings.DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL missing/invalid. Set it in Railway → API service → Variables."
    )
