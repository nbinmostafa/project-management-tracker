def create_project(client, name="Demo"):
    r = client.post("/projects", json={"name": name, "description": "x"})
    assert r.status_code == 201, r.text
    return r.json()


def test_list_tasks_starts_empty(client):
    p = create_project(client)
    r = client.get(f"/projects/{p['id']}/tasks")
    assert r.status_code == 200, r.text
    assert r.json() == []


def test_create_task_project_not_found(client):
    r = client.post("/projects/999999/tasks", json={"title": "x"})
    assert r.status_code == 404
    assert "project" in r.json()["detail"].lower()


def test_create_get_patch_delete_task(client):
    p = create_project(client)

    # Create
    r = client.post(
        f"/projects/{p['id']}/tasks",
        json={"title": "T1", "status": "not_started", "priority": "medium"},
    )
    assert r.status_code == 201, r.text
    task = r.json()
    assert task["project_id"] == p["id"]
    assert task["status"] == "not_started"

    # Get
    r = client.get(f"/tasks/{task['id']}")
    assert r.status_code == 200, r.text
    assert r.json()["id"] == task["id"]

    # Patch: update only status
    r = client.patch(f"/tasks/{task['id']}", json={"status": "done"})
    assert r.status_code == 200, r.text
    patched = r.json()
    assert patched["status"] == "done"
    assert patched["priority"] == "medium"  # unchanged
    assert patched["title"] == "T1"         # unchanged

    # Delete
    r = client.delete(f"/tasks/{task['id']}")
    assert r.status_code == 204, r.text

    # Confirm 404
    r = client.get(f"/tasks/{task['id']}")
    assert r.status_code == 404


def test_create_task_invalid_enum_returns_422(client):
    p = create_project(client)

    r = client.post(
        f"/projects/{p['id']}/tasks",
        json={"title": "Bad", "status": "In Progress", "priority": "medium"},
    )
    assert r.status_code == 422, r.text
