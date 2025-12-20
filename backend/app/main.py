from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.api.v1.projects import router as projects_router
from app.api.v1.tasks import router as tasks_router





app = FastAPI(title="Project Management Tracker")


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"])




app.include_router(projects_router)
app.include_router(tasks_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
