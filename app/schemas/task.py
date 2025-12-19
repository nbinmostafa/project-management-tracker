from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    done = "done"


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    status: TaskStatus = TaskStatus.not_started
    priority: TaskPriority = TaskPriority.medium
    deadline: datetime | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    deadline: datetime | None = None


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    owner_id: str
    title: str
    status: TaskStatus
    priority: TaskPriority
    deadline: datetime | None = None
    created_at: datetime
    updated_at: datetime
