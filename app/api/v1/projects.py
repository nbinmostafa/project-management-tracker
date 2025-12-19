from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.deps import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectRead
from app.core.auth import get_current_user_id

router = APIRouter(prefix="/projects", tags=["projects"])




# ---- Helper
def get_project_or_404(db: Session, project_id: int, owner_id: str) -> Project:
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == owner_id)
        .first()
    )
    if not project:
        # 404 prevents leaking that another user's project exists
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# Create Project
@router.post(
    "",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_current_user_id),
):
    project = Project(
        owner_id=owner_id,
        name=data.name,
        description=data.description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


# Returns All Projects (owned by user)
@router.get("", response_model=List[ProjectRead])
def list_projects(
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_current_user_id),
):
    return (
        db.query(Project)
        .filter(Project.owner_id == owner_id)
        .order_by(Project.id.asc())
        .all()
    )


# Get a Project By Id (owned by user)
@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_current_user_id),
):
    return get_project_or_404(db, project_id, owner_id)


# Delete a Project (owned by user)
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_current_user_id),
):
    project = get_project_or_404(db, project_id, owner_id)
    db.delete(project)
    db.commit()
    return None
