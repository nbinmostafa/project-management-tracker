import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from alembic import command
from alembic.config import Config

# IMPORTANT: set before importing settings that reads ENV_FILE
os.environ["ENV_FILE"] = ".env.test"

from app.main import app
from app.core.settings import settings
from app.db.deps import get_db


# --- Engine/session for TEST DB only
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def apply_migrations():
    """
    Apply Alembic migrations to the test database once per test session.
    """
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    yield


@pytest.fixture()
def db_session():
    """
    Provide a transactional session for a test.
    """
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def clean_db(db_session):
    """
    Ensure each test starts from a clean database state.
    TRUNCATE is fast + resets IDs + cascades to dependent tables.
    """
    db_session.execute(text("TRUNCATE TABLE tasks RESTART IDENTITY CASCADE;"))
    db_session.execute(text("TRUNCATE TABLE projects RESTART IDENTITY CASCADE;"))
    db_session.commit()
    yield


@pytest.fixture()
def client(db_session):
    """
    TestClient that uses the test DB session via dependency override.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
