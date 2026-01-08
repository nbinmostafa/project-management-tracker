# ProjectTracker

ProjectTracker is a **Clerk-authenticated project & task management system** for teams. It provides **Project CRUD**, a **Kanban workflow** with persisted drag-and-drop status updates, and **dashboard insights**, backed by a **FastAPI + PostgreSQL** API and a **Vite + React** frontend.

---
**Live Demo:**  
👉 [View the live application](https://project-management-tracker.vercel.app)
---

## Highlights

- **Clerk authentication** with JWT validation on every API request
- **Owner-scoped multi-tenant data model** (projects/tasks scoped by `owner_id`)
- **Kanban board** with drag-and-drop status changes persisted to the API
- **Dashboard** with live stats + recent activity
- **Project-aware task cards** (resolve project names via API)
- **Health endpoint** for uptime monitoring

---
# Preview

<img width="1918" height="866" alt="demo" src="https://github.com/user-attachments/assets/97d62f1a-c98c-46ed-a138-114c4ce2f27f" />
<img width="1918" height="855" alt="demo2" src="https://github.com/user-attachments/assets/757cc086-f193-40e6-aa18-a51d7e13476d" />
<img width="1918" height="863" alt="demo3" src="https://github.com/user-attachments/assets/98bb47d4-56d4-4ec1-b6ec-f3e4b23501c3" />

---

## Tech Stack

### Frontend
- React 18 (Vite)
- React Router
- Clerk React
- TanStack Query
- DnD Kit

### Backend
- FastAPI
- SQLAlchemy ORM
- Alembic migrations
- Pydantic
- psycopg (PostgreSQL)

### Infrastructure
- PostgreSQL
- Backend default base URL (prod): `https://project-management-tracker-production.up.railway.app`

---

## Architecture

**Frontend (SPA)**  
- Uses `ClerkProvider` and `getToken()` to obtain a Clerk JWT.
- API client attaches `Authorization: Bearer <token>` to every request.
- Calls REST resources for projects/tasks and dashboard stats.

**Backend (FastAPI)**  
- Verifies Clerk-issued JWTs using Clerk **JWKS** + **Issuer** (and optional **Audience**).
- Enforces authentication via `HTTPBearer`.
- Scopes all queries by the validated `owner_id`.
- Returns `404` for non-owned resources to prevent tenant enumeration.

**Database (PostgreSQL)**  
- Projects and tasks are stored in Postgres.
- Migrations managed with Alembic.

---

## Core Features

### Authentication & Security
- Clerk-based authentication and server-side JWT validation
- Owner-scoped queries (`owner_id`) for projects and tasks
- Cross-tenant requests fail safely (resource returns `404`)
- CORS restricted by environment configuration

### Projects
- Create, list, update, delete
- Each project includes:
  - `name`, `description`
  - `created_at`, `updated_at`
  - `owner_id`

### Tasks
- Create/list tasks under a project
- Update task status (Kanban), priority, deadline
- Each task includes:
  - `title`
  - `status`: `not_started | in_progress | done`
  - `priority`: `low | medium | high | urgent`
  - optional `deadline`
  - `created_at`, `updated_at`
  - `owner_id`

---

## API Overview

> All endpoints (except `/health` if you choose) require:
> `Authorization: Bearer <Clerk JWT>`

- `GET /health` — service health probe
- `GET /projects` — list projects (owner-scoped)
- `POST /projects` — create project
- `GET /projects/{project_id}` — get project (owner-scoped)
- `PATCH /projects/{project_id}` — update project (owner-scoped)
- `DELETE /projects/{project_id}` — delete project (owner-scoped)

- `GET /projects/{project_id}/tasks` — list tasks for a project (owner-scoped)
- `POST /projects/{project_id}/tasks` — create task under a project (owner-scoped)

- `GET /tasks/{task_id}` — get task (owner-scoped)
- `PATCH /tasks/{task_id}` — update task (owner-scoped)
- `DELETE /tasks/{task_id}` — delete task (owner-scoped)

---

## Environment Variables

### Backend (`backend/.env`)
Required:
- `DATABASE_URL` — Postgres connection string
- `CLERK_ISSUER` — Clerk issuer URL for your instance
- `CLERK_JWKS_URL` — JWKS endpoint for JWT verification
- `CORS_ORIGINS` — allowed origins (JSON array string)

Optional:
- `CLERK_AUDIENCE` — set if you validate `aud` claim

Example:
```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME

CLERK_ISSUER=https://YOUR-CLERK-INSTANCE.clerk.accounts
CLERK_JWKS_URL=https://YOUR-CLERK-INSTANCE.clerk.accounts/.well-known/jwks.json
CLERK_AUDIENCE=

CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
