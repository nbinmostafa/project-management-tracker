import React, { useEffect, useMemo, useState } from "react"
import { useAuth } from "@clerk/clerk-react"
import StatCard from "../components/ui/StatCard"
import { api } from "../services/api"

function Dashboard() {
  const { getToken } = useAuth()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const stats = useMemo(() => {
    const totalProjects = projects.length
    const totalTasks = tasks.length
    const completed = tasks.filter((t) => t.status === "completed" || t.status === "done").length
    const inProgress = tasks.filter((t) => t.status === "in_progress").length
    return [
      {
        title: "Total Projects",
        value: totalProjects.toString(),
        hint: "Live from your workspace",
        icon: "PR",
        accent: "indigo",
      },
      {
        title: "Total Tasks",
        value: totalTasks.toString(),
        hint: `${inProgress} in progress`,
        icon: "TS",
        accent: "amber",
      },
      {
        title: "Completed Tasks",
        value: completed.toString(),
        hint: `${totalTasks ? Math.round((completed / Math.max(totalTasks, 1)) * 100) : 0}% complete`,
        icon: "OK",
        accent: "emerald",
      },
    ]
  }, [projects, tasks])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const proj = await api.getProjects(getToken)
        setProjects(proj || [])
        if (proj?.length) {
          const taskLists = await Promise.all(
            proj.map(async (p) => {
              try {
                return await api.getTasks(p.id, getToken)
              } catch {
                return []
              }
            })
          )
          setTasks(taskLists.flat())
        } else {
          setTasks([])
        }
      } catch (err) {
        setError("Unable to load workspace data.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  const recentTasks = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
        .slice(0, 5),
    [tasks]
  )

  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
        .slice(0, 5),
    [projects]
  )

  return (
    <div className="dashboard page-shell">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Overview of your workspace activity</p>
        </div>
      </div>
      {loading && <div className="muted">Loading dashboard...</div>}
      {error && <div className="badge warning">{error}</div>}

      {!loading && (
        <div className="dashboard-grid">
          <div className="stat-grid">
            {stats.map((item) => (
              <StatCard key={item.title} {...item} />
            ))}
          </div>

          <div className="dashboard-main">
            <div className="panel">
              <div className="column-header section-head">
                <div>
                  <div className="muted">Recent tasks</div>
                  <h3 className="section-title">What moved last</h3>
                </div>
                <span className="pill">Live</span>
              </div>
              {recentTasks.length === 0 && <div className="muted">No tasks yet.</div>}
              {recentTasks.map((task) => (
                <div key={task.id} className="list-row">
                  <div>
                    <div className="item-title">{task.title}</div>
                    <div className="muted">{task.status === "completed" || task.status === "done" ? "Completed" : "In motion"}</div>
                  </div>
                  <div className="badge info">{new Date(task.updated_at || task.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="column-header section-head">
                <div>
                  <div className="muted">Projects</div>
                  <h3 className="section-title">Latest updates</h3>
                </div>
                <span className="pill">Sync</span>
              </div>
              {recentProjects.length === 0 && <div className="muted">No projects yet.</div>}
              {recentProjects.map((project) => (
                <div key={project.id} className="list-row">
                  <div>
                    <div className="item-title">{project.name}</div>
                    <div className="muted">{project.description || "No description provided."}</div>
                  </div>
                  <div className="badge success">
                    {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
