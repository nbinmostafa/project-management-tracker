from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.getenv("ENV_FILE", ".env"),
        extra="ignore")
    DATABASE_URL: str

    #Clerk Auth
    CLERK_JWKS_URL: str 
    CLERK_ISSUER: str
    CLERK_AUDIENCE: str | None = None  

    # CORS (for frontend tomorrow; safe to add now)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]




settings = Settings()
