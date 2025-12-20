from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=120)]
    description: Annotated[str | None, Field(default=None, max_length=2000)]


class ProjectUpdate(BaseModel):
    name: Annotated[str | None, Field(default=None, min_length=1, max_length=120)]
    description: Annotated[str | None, Field(default=None, max_length=2000)]


class ProjectRead(BaseModel):
    id: int
    owner_id: str
    name: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
