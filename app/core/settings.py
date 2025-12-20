from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import os
from typing import List, Optional
import json

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.getenv("ENV_FILE", ".env"),
        extra="ignore",
    )

    DATABASE_URL: str = ""

    CLERK_JWKS_URL: str = ""
    CLERK_ISSUER: str = ""
    CLERK_AUDIENCE: Optional[str] = None

    CORS_ORIGINS: List[str] = []

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_db_url(cls, v):
        if not v:
            return ""
        s = str(v).strip().strip('"').strip("'")
        if s.startswith("postgres://"):
            s = s.replace("postgres://", "postgresql+psycopg://", 1)
        return s

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return v
        s = str(v).strip()
        if not s:
            return []
        if s.startswith("["):
            return json.loads(s)
        return [x.strip() for x in s.split(",") if x.strip()]

settings = Settings()

if not settings.DATABASE_URL or "://" not in settings.DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL missing/invalid. Set it in Railway → API service → Variables."
    )