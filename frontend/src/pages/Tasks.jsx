import React, { useEffect, useState } from "react"
import { useAuth } from "@clerk/clerk-react"
import { api } from "../services/api"

const columns = [
  { key: "not_started", title: "Not Started", subtitle: "Ready to be picked up" },
  { key: "in_progress", title: "In Progress", subtitle: "Currently being worked on" },
  { key: "done", title: "Completed", subtitle: "Reviewed and shipped" },
]

const statusBadge = {
  not_started: "info",
  in_progress: "warning",
  completed: "success",
}

function Tasks() {
  const { getToken } = useAuth()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    api.getTasks(undefined, getToken).then(setTasks).catch(() => setTasks([]))
  }, [getToken])

  return (
    <div className="tasks">
      <div className="column-header section-head">
        <div>
          <div className="muted">Kanban</div>
          <h3 className="section-title">Task board</h3>
        </div>
        <span className="pill">Drag-friendly</span>
      </div>

      <div className="kanban" role="list">
        {columns.map((col) => {
          const columnTasks = tasks.filter((task) => task.status === col.key)
          return (
            <div key={col.key} className="kanban-column" role="listitem">
              <div className="column-header">
                <div>
                  <div className="muted">Status</div>
                  <h3 className="section-title">{col.title}</h3>
                </div>
                <div className={`badge tiny-badge ${statusBadge[col.key]}`}>{columnTasks.length} tasks</div>
              </div>
              <div className="column-subtitle">{col.subtitle}</div>
              {columnTasks.map((task) => (
                <div key={task.id} className="task-card" draggable>
                  <div className="item-title">{task.title}</div>
                  <div className="muted">Project #{task.project_id}</div>
                  <div className="status-label">
                    <span className={`status-dot ${task.status}`} />
                    {task.status}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Tasks
