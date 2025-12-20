from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.project import Project
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.core.auth import get_current_user_id

router = APIRouter(tags=["tasks"])



# --- Helper Functions
def get_project_or_404(db: Session, project_id: int, owner_id: str) -> Project:
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == owner_id)
        .first()
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


def get_task_or_404(db: Session, task_id: int, owner_id: str) -> Task:
    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.owner_id == owner_id)
        .first()
    )
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.post(
    "/projects/{project_id}/tasks",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    project_id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_current_user_id),
):
    # Ensure the project belongs to the user
    get_project_or_404(db, project_id, owner_id)

    # Set ownership server-side (never trust client)
    task = Task(
        project_id=project_id,
        owner_id=owner_id,
        **payload.model_dump(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get(
    "/projects/{project_id}/tasks",
    response_model=list[TaskRead],
)
def list_tasks_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_current_user_id),
):
    # Ensure the project belongs to the user
    get_project_or_404(db, project_id, owner_id)

    return (
        db.query(Task)
        .filter(Task.project_id == project_id, Task.owner_id == owner_id)
        .order_by(Task.id.asc())
        .all()
    )


@router.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_current_user_id),
):
    return get_task_or_404(db, task_id, owner_id)


@router.patch("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_current_user_id),
):
    task = get_task_or_404(db, task_id, owner_id)

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_current_user_id),
):
    task = get_task_or_404(db, task_id, owner_id)

    db.delete(task)
    db.commit()
    return None
