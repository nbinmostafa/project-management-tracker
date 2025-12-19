# Project Management Tracker

A backend service for managing projects and tasks, designed with a focus on clean architecture, data integrity, and production-ready API design.  
🧩 Built to reflect how internal tools are structured and maintained in professional software environments.

---

## Overview

The Project Management Tracker provides a RESTful API that enables users to create projects and manage tasks associated with them. Tasks include structured metadata such as status, priority, and deadlines, allowing for clear progress tracking and extensible workflow logic.

The application follows a backend-first approach and is intentionally designed to support future additions such as authentication, authorization, and a frontend client without requiring architectural changes.

---

<details>
<summary><strong>Application Features</strong></summary>

### Project Management
- Designed a project entity to act as the top-level organizational boundary  
- Implemented full lifecycle management (create, read, update, delete)  
- Structured to support future ownership, permissions, and multi-user access  

### Task Management
- Modeled tasks as relational entities linked to projects via foreign keys  
- Implemented task attributes including status, priority, and deadlines  
- Enforced data integrity through schema validation and database constraints  
- Designed task state to remain consistent across updates and deletions  

### API Layer
- Designed RESTful endpoints with predictable behavior and naming conventions  
- Implemented versioned routing to support backward-compatible changes  
- Used explicit request and response schemas to enforce correctness  
- Ensured clear separation between routing, business logic, and persistence  

</details>

---

<details>
<summary><strong>Architecture & Engineering Approach</strong></summary>

- Modular project structure separating routes, schemas, models, and database logic  
- Relational data modeling using SQLAlchemy 2.x ORM patterns  
- Validation-first development using Pydantic to prevent invalid state  
- Automated testing to verify core behavior and database interactions  
- Containerized setup to ensure consistent local and deployment environments  

</details>

---

<details>
<summary><strong>Technology Stack</strong></summary>

- **FastAPI** — high-performance API framework with strong typing  
- **PostgreSQL** — relational database for structured persistence  
- **SQLAlchemy (2.x)** — ORM for database interactions  
- **Pydantic** — schema validation and serialization  
- **Pytest** — automated testing framework  
- **Docker** — containerization for consistent environments  

</details>

---

<details>
<summary><strong>Testing</strong></summary>

- Unit and integration tests covering core API behavior  
- Database operations tested independently of the API layer  
- Enables confident refactoring and future feature expansion  

</details>

---

<details>
<summary><strong>Future Improvements</strong></summary>

- Authentication and authorization (OAuth / JWT)  
- Role-based access control for project and task ownership  
- Frontend client integration  
- Cloud deployment with managed database services  
- Activity logging and audit trails  

</details>

---

## Purpose

This project was built to demonstrate practical backend engineering skills, including relational data modeling, API design, and maintainable system architecture, aligned with expectations for modern software engineering roles.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
