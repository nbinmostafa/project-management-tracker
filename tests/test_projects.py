import string


# ---------- Helpers (small reusable functions) ----------

def create_project(client, name="Test Project", description="desc"):
    # Send a POST request to create a project
    return client.post("/projects", json={"name": name, "description": description})


# ---------- Basic health ----------

def test_health(client):
    # Call /health
    r = client.get("/health")
    # Expect HTTP 200 OK
    assert r.status_code == 200
    # Expect the JSON body
    assert r.json() == {"status": "ok"}


# ---------- CREATE tests ----------

def test_create_project_success(client):
    r = create_project(client, name="Jira MVP", description="Board 1")
    assert r.status_code == 201

    data = r.json()
    # id should be an integer (Postgres serial/int)
    assert isinstance(data["id"], int)
    assert data["name"] == "Jira MVP"
    assert data["description"] == "Board 1"


def test_create_project_description_optional(client):
    # description can be omitted or null
    r = client.post("/projects", json={"name": "No Desc", "description": None})
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "No Desc"
    assert data["description"] is None


def test_create_project_validation_empty_name(client):
    # name has min_length=1, so empty should fail with 422
    r = create_project(client, name="", description="x")
    assert r.status_code == 422


def test_create_project_validation_name_too_long(client):
    # name max_length=120 (from schema)
    long_name = "a" * 121
    r = create_project(client, name=long_name, description="x")
    assert r.status_code == 422


def test_create_project_validation_description_too_long(client):
    # description max_length=2000 (from schema)
    long_desc = "a" * 2001
    r = create_project(client, name="Valid", description=long_desc)
    assert r.status_code == 422


# ---------- LIST tests ----------

def test_list_projects_initially_empty(client):
    # List projects before creating any
    r = client.get("/projects")
    assert r.status_code == 200
    assert r.json() == []


def test_list_projects_after_creates(client):
    # Create multiple projects
    create_project(client, name="P1", description="d1")
    create_project(client, name="P2", description="d2")
    create_project(client, name="P3", description="d3")

    # List them
    r = client.get("/projects")
    assert r.status_code == 200
    items = r.json()

    # Expect at least 3
    assert len(items) >= 3

    # Ensure names appear
    names = [p["name"] for p in items]
    assert "P1" in names
    assert "P2" in names
    assert "P3" in names


def test_list_projects_ordering_asc_by_id(client):
    create_project(client, name="Old", description="x")
    create_project(client, name="Newer", description="x")

    r = client.get("/projects")
    items = r.json()

    ids = [p["id"] for p in items]
    assert ids == sorted(ids)


# ---------- GET tests ----------

def test_get_project_success(client):
    created = create_project(client, name="Lookup", description="x").json()
    project_id = created["id"]

    r = client.get(f"/projects/{project_id}")
    assert r.status_code == 200

    data = r.json()
    assert data["id"] == project_id
    assert data["name"] == "Lookup"


def test_get_project_not_found(client):
    r = client.get("/projects/999999999")
    assert r.status_code == 404
    assert r.json()["detail"] == "Project not found"


def test_get_project_invalid_id_type(client):
    # non-int path param should 422 (FastAPI validation)
    r = client.get("/projects/not-a-number")
    assert r.status_code == 422


# ---------- DELETE tests ----------

def test_delete_project_success(client):
    created = create_project(client, name="ToDelete", description="x").json()
    project_id = created["id"]

    r = client.delete(f"/projects/{project_id}")
    # 204 means success with no body
    assert r.status_code == 204
    assert r.text == ""

    # Confirm it is gone
    r2 = client.get(f"/projects/{project_id}")
    assert r2.status_code == 404


def test_delete_project_not_found(client):
    r = client.delete("/projects/999999999")
    assert r.status_code == 404
    assert r.json()["detail"] == "Project not found"


def test_delete_many_projects(client):
    # Create a bunch
    created_ids = []
    for i in range(10):
        data = create_project(client, name=f"Bulk-{i}", description="x").json()
        created_ids.append(data["id"])

    # Delete them all
    for pid in created_ids:
        r = client.delete(f"/projects/{pid}")
        assert r.status_code == 204

    # List should not show them (or at least none of those ids)
    r = client.get("/projects")
    assert r.status_code == 200
    items = r.json()
    ids_left = {p["id"] for p in items}
    for pid in created_ids:
        assert pid not in ids_left


# ---------- Robustness / “industry” expectations ----------

def test_create_many_projects_and_verify_unique_ids(client):
    # Create many projects and ensure ids are unique and increasing
    ids = []
    for i in range(20):
        data = create_project(client, name=f"Many-{i}", description="x").json()
        ids.append(data["id"])

    # All ids should be unique
    assert len(ids) == len(set(ids))
