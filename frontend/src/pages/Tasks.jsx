import React, { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@clerk/clerk-react"
import { api } from "../services/api"

const columns = [
  { key: "not_started", title: "Not Started", subtitle: "Queued and ready" },
  { key: "in_progress", title: "In Progress", subtitle: "Actively being worked" },
  { key: "done", title: "Completed", subtitle: "Reviewed and shipped" },
]

const statusBadge = {
  not_started: "info",
  in_progress: "warning",
  done: "success",
}

const statusLabel = (status) => api.statusLabels?.[status] || status

function Tasks() {
  const { getToken } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [projectNames, setProjectNames] = useState({})
  const pendingProjectsRef = useRef(new Set())

  const [draggingId, setDraggingId] = useState(null)
  const [overColumn, setOverColumn] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError("")

    api
      .getTasks(undefined, getToken)
      .then((t) => {
        if (!alive) return
        setTasks(Array.isArray(t) ? t : [])
      })
      .catch((e) => {
        if (!alive) return
        setTasks([])
        setError(e?.message || "Failed to load tasks.")
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [getToken])

  const projectIds = useMemo(() => {
    const ids = new Set()
    for (const t of tasks) {
      if (t?.project_id !== undefined && t?.project_id !== null) {
        ids.add(t.project_id)
      }
    }
    return Array.from(ids)
  }, [tasks])

  const projectNamesMap = useMemo(() => {
    const map = new Map()
    Object.entries(projectNames).forEach(([id, name]) => {
      map.set(id, name)
      const numericId = Number(id)
      if (!Number.isNaN(numericId)) {
        map.set(numericId, name)
      }
    })
    return map
  }, [projectNames])

  useEffect(() => {
    let alive = true

    const fetchProjectNames = async () => {
      if (!projectIds.length) return
      const missing = projectIds.filter(
        (id) => projectNames[id] === undefined && !pendingProjectsRef.current.has(id)
      )
      if (!missing.length) return

      missing.forEach((id) => pendingProjectsRef.current.add(id))

      const results = await Promise.allSettled(missing.map((id) => api.getProjectById(id, getToken)))
      if (!alive) return

      const next = { ...projectNames }
      results.forEach((res, idx) => {
        const id = missing[idx]
        pendingProjectsRef.current.delete(id)
        if (res.status === "fulfilled" && res.value) {
          next[String(id)] = res.value.name ?? null
        } else if (next[String(id)] === undefined) {
          next[String(id)] = null
        }
      })

      setProjectNames(next)
    }

    fetchProjectNames()

    return () => {
      alive = false
    }
  }, [projectIds, getToken, projectNames])

  const tasksById = useMemo(() => {
    const m = new Map()
    for (const t of tasks) m.set(String(t.id), t)
    return m
  }, [tasks])

  const grouped = useMemo(() => {
    const g = { not_started: [], in_progress: [], done: [] }
    for (const t of tasks) {
      if (t.status === "in_progress") g.in_progress.push(t)
      else if (t.status === "done") g.done.push(t)
      else g.not_started.push(t)
    }
    return g
  }, [tasks])

  const stats = useMemo(() => {
    const total = tasks.length
    const doneCount = grouped.done.length
    const inProgCount = grouped.in_progress.length
    const pct = total ? Math.round((doneCount / total) * 100) : 0
    return { total, doneCount, inProgCount, pct }
  }, [tasks.length, grouped])

  const onDragStart = (e, taskId) => {
    const id = String(taskId)
    setDraggingId(id)
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
  }

  const onDragEnd = () => {
    setDraggingId(null)
    setOverColumn(null)
  }

  const onColumnDragOver = (e, columnKey) => {
    e.preventDefault()
    setOverColumn(columnKey)
    e.dataTransfer.dropEffect = "move"
  }

  const onColumnDrop = async (e, columnKey) => {
    e.preventDefault()
    const droppedId = e.dataTransfer.getData("text/plain") || draggingId
    if (!droppedId) return

    const task = tasksById.get(String(droppedId))
    if (!task) return

    const prevStatus = task.status
    const nextStatus = columnKey // Backend enum values

    if (prevStatus === nextStatus) {
      setDraggingId(null)
      setOverColumn(null)
      return
    }

    setTasks((prev) => prev.map((t) => (String(t.id) === String(droppedId) ? { ...t, status: nextStatus } : t)))

    try {
      await api.updateTask(droppedId, { status: nextStatus }, getToken)
    } catch (err) {
      setTasks((prev) => prev.map((t) => (String(t.id) === String(droppedId) ? { ...t, status: prevStatus } : t)))
      setError(err?.message || "Failed to update task status.")
    } finally {
      setDraggingId(null)
      setOverColumn(null)
    }
  }

  return (
    <div className="tasks tasks--saas">
      <div className="section-head section-head--saas">
        <div>
          <div className="muted">Workflow</div>
          <h3 className="section-title">Task board</h3>

          <div className="tasks-meta tasks-meta--saas">
            <span className="pill">{loading ? "Loading..." : `${stats.total} tasks`}</span>
            <span className="pill">{`${stats.inProgCount} in progress`}</span>
            <span className="pill">{`${stats.doneCount} completed (${stats.pct}%)`}</span>
          </div>
        </div>

        <div className="tasks-actions tasks-actions--saas">
          <span className="pill">Drag & drop updates status</span>
        </div>
      </div>

      {error ? (
        <div className="panel panel--saas" style={{ marginBottom: 14 }}>
          <div className="badge warning">Error</div>
          <div className="muted" style={{ marginTop: 8 }}>
            {error}
          </div>
        </div>
      ) : null}

      <div className="kanban kanban--saas" role="list">
        {columns.map((col) => {
          const items = grouped[col.key] || []
          const isOver = overColumn === col.key

          return (
            <div
              key={col.key}
              className={`kanban-column kanban-column--saas ${isOver ? "drop-over" : ""}`}
              role="listitem"
              onDragOver={(e) => onColumnDragOver(e, col.key)}
              onDragLeave={() => setOverColumn(null)}
              onDrop={(e) => onColumnDrop(e, col.key)}
              aria-label={`Column ${col.title}`}
            >
              <div className="column-top column-top--saas">
                <div>
                  <div className="muted">Status</div>
                  <h3 className="section-title">{col.title}</h3>
                </div>
                <div className={`badge tiny-badge ${statusBadge[col.key]}`}>{items.length}</div>
              </div>

              <div className="column-subtitle">{col.subtitle}</div>

              <div className="kanban-cards kanban-cards--saas">
                {items.map((task) => {
                  const isDragging = String(task.id) === String(draggingId)

                  return (
                    <div
                      key={task.id}
                      className={`task-card task-card--saas ${isDragging ? "dragging" : ""}`}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      onDragEnd={onDragEnd}
                      title="Drag to move"
                    >
                      <div className="task-head task-head--saas">
                        <div className="item-title">{task.title}</div>
                        <div className={`status-chip status-chip--saas ${task.status}`}>{statusLabel(task.status)}</div>
                      </div>

                      <div className="task-meta task-meta--saas">
                        <div className="muted">
                          {projectNames[task.project_id] ||
                            projectNamesMap.get(task.project_id) ||
                            `Project #${task.project_id}`}
                        </div>
                        <div className="status-inline">
                          <span className={`status-dot ${task.status}`} />
                          <span className="muted">{statusLabel(task.status)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {!loading && items.length === 0 ? (
                  <div className="empty-state empty-state--saas">
                    <div className="muted">No tasks in this lane.</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                      Drag tasks here to update their status.
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Tasks
