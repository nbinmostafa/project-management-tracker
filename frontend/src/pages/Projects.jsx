import React, { useEffect, useState } from "react"
import { useAuth } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"

function Projects() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [tasksByProject, setTasksByProject] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
  })
  const [modalMode, setModalMode] = useState("create")
  const [activeProjectId, setActiveProjectId] = useState(null)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getProjects(getToken)
      setProjects(data || [])
      if (data?.length) {
        const taskEntries = await Promise.all(
          data.map(async (proj) => {
            try {
              const tasks = await api.getTasks(proj.id, getToken)
              return [proj.id, tasks || []]
            } catch {
              return [proj.id, []]
            }
          })
        )
        setTasksByProject(Object.fromEntries(taskEntries))
      } else {
        setTasksByProject({})
      }
    } catch (err) {
      setError("Unable to load projects right now.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [getToken])

  const openCreateModal = () => {
    setForm({
      name: "",
      description: "",
    })
    setModalMode("create")
    setActiveProjectId(null)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (project) => {
    setForm({
      name: project.name || "",
      description: project.description || "",
    })
    setModalMode("edit")
    setActiveProjectId(project.id)
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm("Delete this project?")
    if (!confirmed) return
    try {
      await api.deleteProject(projectId, getToken)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      setTasksByProject((prev) => {
        const copy = { ...prev }
        delete copy[projectId]
        return copy
      })
    } catch (err) {
      setError("Unable to delete project right now.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim()) {
      setFormError("Name is required.")
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() ? form.description.trim() : null,
      }
      if (modalMode === "edit" && activeProjectId) {
        const updated = await api.updateProject(activeProjectId, payload, getToken)
        setProjects((prev) => prev.map((p) => (p.id === activeProjectId ? updated : p)))
      } else {
        const created = await api.createProject(payload, getToken)
        if (created?.id) {
          setProjects((prev) => [created, ...prev])
          setTasksByProject((prev) => ({ ...prev, [created.id]: [] }))
        }
      }
      setActiveProjectId(null)
      setIsModalOpen(false)
    } catch (err) {
      const friendly = err?.message || "Unable to save project. Please try again."
      setFormError(friendly)
    } finally {
      setSaving(false)
    }
  }

  const totalProjects = projects.length
  const recentCount = projects.filter((p) => {
    const created = new Date(p.created_at || p.updated_at || Date.now())
    const thirtyDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 30
    return created.getTime() >= thirtyDaysAgo
  }).length
  const lastUpdated = projects
    .map((p) => new Date(p.updated_at || p.created_at).getTime())
    .sort((a, b) => b - a)[0]

  return (
    <div className="projects page-shell">
      <div className="projects-hero">
        <div className="hero-text">
          <div className="eyebrow">Projects</div>
          <h2 className="section-title">Plan and deliver work with clarity</h2>
          <p className="muted">
            Organize initiatives, capture context, and keep the team aligned. Every project is backed by real data from
            your API.
          </p>
          <div className="hero-meta">
            <span className="pill">Total {totalProjects}</span>
            <span className="pill soft">{recentCount} added last 30 days</span>
            <span className="pill soft">
              {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleDateString()}` : "No activity yet"}
            </span>
          </div>
        </div>
        <div className="hero-actions">
          <button type="button" className="ghost-btn" onClick={loadProjects} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button type="button" className="primary-btn" onClick={openCreateModal}>
            + New Project
          </button>
        </div>
      </div>

      <div className="project-stats">
        <div className="tile">
          <div className="muted">Active projects</div>
          <div className="tile-value">{totalProjects}</div>
          <div className="tile-hint">Live from your backend</div>
        </div>
        <div className="tile">
          <div className="muted">Added last 30 days</div>
          <div className="tile-value">{recentCount}</div>
          <div className="tile-hint">Recent momentum</div>
        </div>
        <div className="tile">
          <div className="muted">Last updated</div>
          <div className="tile-value">{lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "No data"}</div>
          <div className="tile-hint">Syncs automatically</div>
        </div>
      </div>

      {loading && <div className="muted">Loading projects...</div>}
      {error && <div className="badge warning">{error}</div>}

      {!loading && !error && (
        <>
          <div className="project-grid modern">
            {projects.map((project) => {
              const previewTasks = (tasksByProject[project.id] || []).slice(0, 3)
              const remaining = Math.max((tasksByProject[project.id] || []).length - 3, 0)
              return (
                <div
                  key={project.id}
                  className="project-card modern"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      navigate(`/projects/${project.id}`)
                    }
                  }}
                >
                  <div className="project-card-header">
                    <div>
                      <div className="item-title">{project.name}</div>
                      <div className="muted">{project.description || "No description provided."}</div>
                    </div>
                    <div className="project-dates">
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                      <span>Updated {new Date(project.updated_at || project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="task-preview">
                    {previewTasks.map((task) => (
                      <div key={task.id} className="task-chip">
                        <span className={`status-dot ${task.status}`} aria-hidden="true" />
                        <span className="task-title">{task.title}</span>
                      </div>
                    ))}
                    {previewTasks.length === 0 && <div className="muted">No tasks yet.</div>}
                    {remaining > 0 && <div className="muted">+{remaining} more</div>}
                  </div>
                  <div className="project-actions">
                    <button
                      type="button"
                      className="subtle-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(project)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(project.id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {projects.length === 0 && (
            <div className="project-empty">
              <div className="item-title">No projects yet</div>
              <div className="muted">Create your first project to start organizing your work.</div>
              <button type="button" className="primary-btn" onClick={openCreateModal}>
                Create project
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="column-header modal-header">
              <h3 className="section-title">{modalMode === "edit" ? "Edit project" : "New project"}</h3>
              <button type="button" className="subtle-btn" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label className="input-label">
                <span>Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </label>

              <label className="input-label">
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="What is this project about?"
                />
              </label>

              {formError && <div className="form-error">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="subtle-btn" onClick={() => setIsModalOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? (
                    <span className="btn-loading">
                      <span className="spinner" aria-hidden="true" />
                      {modalMode === "edit" ? "Saving..." : "Creating..."}
                    </span>
                  ) : (
                    modalMode === "edit" ? "Save changes" : "Create project"
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

export default Projects
