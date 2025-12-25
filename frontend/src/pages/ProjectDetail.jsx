import React, { useEffect, useMemo, useState } from "react"
import { DndContext, closestCenter, useDroppable, useDraggable } from "@dnd-kit/core"
import { useAuth } from "@clerk/clerk-react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "../services/api"

const statusOptions = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Completed" },
]

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0 })
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    priority: "",
    sort_by: "created_at",
    sort_order: "desc",
    page_size: 20,
    page: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskSaving, setTaskSaving] = useState(false)
  const [taskError, setTaskError] = useState(null)
  const [taskMode, setTaskMode] = useState("create")
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [taskForm, setTaskForm] = useState({
    title: "",
    status: statusOptions[0].value,
    priority: priorityOptions[1].value,
    deadline: "",
  })
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("taskViewMode") || "list")

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [proj, taskRes] = await Promise.all([
        api.getProject(projectId, getToken),
        api.listTasksByProject(projectId, { ...filters, page: filters.page }, getToken),
      ])
      setProject(proj)
      setTasks(taskRes?.items || [])
      setPagination({
        page: taskRes?.page || 1,
        page_size: taskRes?.page_size || filters.page_size,
        total: taskRes?.total || 0,
      })
    } catch (err) {
      setError("Unable to load project.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [projectId, getToken, filters.page, filters.page_size, filters.status, filters.priority, filters.q, filters.sort_by, filters.sort_order])

  const openNewTask = () => {
    setTaskForm({ title: "", status: statusOptions[0].value, priority: priorityOptions[1].value, deadline: "" })
    setTaskMode("create")
    setActiveTaskId(null)
    setTaskError(null)
    setTaskModalOpen(true)
  }

  const openEditTask = (task) => {
    setTaskForm({
      title: task.title || "",
      status: task.status || statusOptions[0].value,
      priority: task.priority || priorityOptions[1].value,
      deadline: task.deadline ? task.deadline.slice(0, 10) : "",
    })
    setTaskMode("edit")
    setActiveTaskId(task.id)
    setTaskError(null)
    setTaskModalOpen(true)
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    setTaskError(null)
    if (!taskForm.title.trim()) {
      setTaskError("Title is required.")
      return
    }
    setTaskSaving(true)
    const payload = {
      title: taskForm.title.trim(),
      status: taskForm.status,
      priority: taskForm.priority,
      deadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : null,
    }
    try {
      if (taskMode === "edit" && activeTaskId) {
        const updated = await api.updateTask(activeTaskId, payload, getToken)
        setTasks((prev) => prev.map((t) => (t.id === activeTaskId ? updated : t)))
      } else {
        const created = await api.createTask(projectId, payload, getToken)
        if (created?.id) {
          setTasks((prev) => [created, ...prev])
        }
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }))
      }
      setTaskModalOpen(false)
      setActiveTaskId(null)
    } catch (err) {
      setTaskError(err?.message || "Unable to save task.")
    } finally {
      setTaskSaving(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm("Delete this task?")
    if (!confirmed) return
    try {
      await api.deleteTask(taskId, getToken)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err) {
      setTaskError("Unable to delete task right now.")
    }
  }

  const friendlyStatus = (status) => {
    if (status === "not_started") return "Not Started"
    if (status === "in_progress") return "In Progress"
    if (status === "done") return "Completed"
    return status
  }

  const friendlyPriority = (priority) => {
    if (priority === "low") return "Low"
    if (priority === "high") return "High"
    return "Medium"
  }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((pagination.total || 0) / (pagination.page_size || 20))),
    [pagination.total, pagination.page_size]
  )

  return (
    <div className="project-detail">
      <div className="detail-header">
        <div className="header-actions end">
          <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <button type="button" className="primary-btn" onClick={openNewTask}>
            New Task
          </button>
        </div>
        {loading && <div className="muted">Loading project...</div>}
        {error && <div className="badge warning">{error}</div>}
        {!loading && project && (
          <>
            <h2 className="section-title">{project.name}</h2>
            <div className="muted">{project.description || "No description provided."}</div>
          </>
        )}
      </div>

      <div className="panel">
        <div className="column-header section-head">
          <div>
            <div className="muted">Tasks</div>
            <h3 className="section-title">Project tasks</h3>
          </div>
          <button type="button" className="ghost-btn" onClick={openNewTask}>
            + New Task
          </button>
        </div>

        <div className="toolbar">
          <input
            type="search"
            placeholder="Search tasks"
            className="toolbar-input"
            value={filters.q}
            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value, page: 1 }))}
          />
          <select
            className="toolbar-select"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <option value="">All status</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="toolbar-select"
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value, page: 1 }))}
          >
            <option value="">All priority</option>
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="toolbar-select"
            value={filters.sort_by}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort_by: e.target.value }))}
          >
            <option value="created_at">Created</option>
            <option value="updated_at">Updated</option>
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
          </select>
          <select
            className="toolbar-select"
            value={filters.sort_order}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort_order: e.target.value }))}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <select
            className="toolbar-select"
            value={filters.page_size}
            onChange={(e) => setFilters((prev) => ({ ...prev, page_size: Number(e.target.value) || 20, page: 1 }))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            type="button"
            className={`ghost-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => {
              setViewMode("list")
              localStorage.setItem("taskViewMode", "list")
            }}
          >
            List
          </button>
          <button
            type="button"
            className={`ghost-btn ${viewMode === "kanban" ? "active" : ""}`}
            onClick={() => {
              setViewMode("kanban")
              localStorage.setItem("taskViewMode", "kanban")
            }}
          >
            Kanban
          </button>
        </div>

        {loading && <div className="muted">Loading tasks...</div>}
        {!loading && tasks.length === 0 && <div className="muted">No tasks yet for this project.</div>}

        {!loading && tasks.length > 0 && viewMode === "list" && (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-row">
                <div className="task-row-head">
                  <div className="item-title">{task.title}</div>
                  <div className="pill status">
                    <span className={`status-dot ${task.status}`} aria-hidden="true" />
                    {friendlyStatus(task.status)}
                  </div>
                </div>
                <div className="task-row-meta">
                  <span className={`badge ${task.priority === "high" ? "warning" : task.priority === "medium" ? "info" : "muted"}`}>
                    Priority: {friendlyPriority(task.priority)}
                  </span>
                  <span className="muted">Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "None"}</span>
                  <span className="muted">
                    Updated: {new Date(task.updated_at || task.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="task-row-actions">
                  <button type="button" className="subtle-btn" onClick={() => openEditTask(task)}>
                    Edit
                  </button>
                  <button type="button" className="ghost-btn" onClick={() => handleDeleteTask(task.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tasks.length > 0 && viewMode === "kanban" && (
          <KanbanBoard
            tasks={tasks}
            onEdit={openEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={async (taskId, newStatus) => {
              const previous = tasks
              setTasks((cur) =>
                cur.map((t) => (t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
              )
              try {
                await api.updateTask(taskId, { status: newStatus }, getToken)
              } catch (err) {
                setTasks(previous)
                setTaskError(err?.message || "Unable to update task status.")
              }
            }}
          />
        )}

        {taskError && <div className="form-error">{taskError}</div>}

        <div className="pagination">
          <button
            type="button"
            className="subtle-btn"
            disabled={pagination.page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
          >
            Previous
          </button>
          <span className="muted">
            Page {pagination.page} of {totalPages}
          </span>
          <button
            type="button"
            className="ghost-btn"
            disabled={pagination.page >= totalPages}
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
          >
            Next
          </button>
        </div>
      </div>

      {taskModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="column-header modal-header">
              <h3 className="section-title">{taskMode === "edit" ? "Edit task" : "New task"}</h3>
              <button type="button" className="subtle-btn" onClick={() => setTaskModalOpen(false)}>
                Close
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="modal-form">
              <label className="input-label">
                <span>Title</span>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </label>

              <label className="input-label">
                <span>Status</span>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="input-label">
                <span>Priority</span>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value }))}
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="input-label">
                <span>Deadline</span>
                <input
                  type="date"
                  value={taskForm.deadline || ""}
                  placeholder="YYYY-MM-DD"
                  pattern="\d{4}-\d{2}-\d{2}"
                  inputMode="numeric"
                  title="Use YYYY-MM-DD"
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, deadline: e.target.value }))}
                />
              </label>

              {taskError && <div className="form-error">{taskError}</div>}

              <div className="modal-actions">
                <button type="button" className="subtle-btn" onClick={() => setTaskModalOpen(false)} disabled={taskSaving}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={taskSaving}>
                  {taskSaving ? (
                    <span className="btn-loading">
                      <span className="spinner" aria-hidden="true" />
                      {taskMode === "edit" ? "Saving..." : "Creating..."}
                    </span>
                  ) : (
                    taskMode === "edit" ? "Save changes" : "Create task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail

function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange }) {
  const columns = [
    { key: "not_started", title: "Not started" },
    { key: "in_progress", title: "In progress" },
    { key: "done", title: "Completed" },
  ]

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over) return
        const newStatus = over.id
        if (!newStatus || newStatus === "board") return
        onStatusChange(active.id, newStatus)
      }}
    >
      <div className="kanban">
        {columns.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key)
          return <KanbanColumn key={col.key} column={col} tasks={columnTasks} onEdit={onEdit} onDelete={onDelete} />
        })}
      </div>
    </DndContext>
  )
}

function KanbanColumn({ column, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key })
  return (
    <div ref={setNodeRef} className="kanban-column" data-active={isOver ? "true" : "false"}>
      <div className="column-header">
        <div>
          <div className="muted">Status</div>
          <h3 className="section-title">
            {column.title} · {tasks.length}
          </h3>
        </div>
      </div>
      <div className="column-subtitle">Drag cards here</div>
      {tasks.map((task) => (
        <KanbanCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

function KanbanCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({ id: task.id })
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }
  const friendlyPriority = (p) => (p === "high" ? "High" : p === "low" ? "Low" : "Medium")
  const friendlyStatus = (s) => {
    if (s === "in_progress") return "In progress"
    if (s === "done") return "Completed"
    return "Not started"
  }

  return (
    <div ref={setNodeRef} style={style} className="task-card kanban-card" {...listeners} {...attributes}>
      <div className="item-title">{task.title}</div>
      <div className="task-card-meta">
        <span className={`badge ${task.priority === "high" ? "warning" : task.priority === "medium" ? "info" : "muted"}`}>
          {friendlyPriority(task.priority)}
        </span>
        <span className="badge info">{friendlyStatus(task.status)}</span>
        <span className="muted">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</span>
      </div>
      <div className="task-row-actions">
        <button type="button" className="subtle-btn" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="ghost-btn" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  )
}
