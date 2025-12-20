import { apiClient } from "../lib/apiClient"

const statusLabels = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
}

const buildQuery = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value))
    }
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

export const api = {
  getDashboard: async (getToken) => {
    const projects = await apiClient.get("/projects", { getToken })
    let tasks = []
    for (const proj of projects) {
      try {
        const res = await apiClient.get(`/projects/${proj.id}/tasks`, { getToken })
        const items = Array.isArray(res) ? res : res?.items || []
        tasks = tasks.concat(items || [])
      } catch {
        // ignore failed project task fetch
      }
    }
    const completed = tasks.filter((t) => t.status === "completed" || t.status === "done").length
    const inProgress = tasks.filter((t) => t.status === "in_progress").length
    return {
      stats: [
        { title: "Total Projects", value: String(projects.length), hint: "Live data", icon: "PR", accent: "indigo" },
        { title: "Total Tasks", value: String(tasks.length), hint: `${inProgress} in progress`, icon: "TS", accent: "amber" },
        {
          title: "Completed Tasks",
          value: String(completed),
          hint: `${tasks.length ? Math.round((completed / Math.max(tasks.length, 1)) * 100) : 0}% complete`,
          icon: "OK",
          accent: "emerald",
        },
      ],
      upcoming: [],
      highlights: [],
    }
  },

  // Projects
  getProjects: (getToken) => apiClient.get("/projects", { getToken }),
  getProject: (projectId, getToken) => apiClient.get(`/projects/${projectId}`, { getToken }),
  createProject: (payload, getToken) => apiClient.post("/projects", payload, { getToken }),
  updateProject: (projectId, payload, getToken) => apiClient.put(`/projects/${projectId}`, payload, { getToken }),
  deleteProject: (projectId, getToken) => apiClient.delete(`/projects/${projectId}`, { getToken }),

  // Tasks
  listTasksByProject: async (projectId, params = {}, getToken) => {
    const res = await apiClient.get(`/projects/${projectId}/tasks${buildQuery(params)}`, { getToken })
    if (Array.isArray(res)) {
      return { items: res, page: 1, page_size: res.length, total: res.length }
    }
    return {
      items: res?.items || [],
      page: res?.page || 1,
      page_size: res?.page_size || params?.page_size || 20,
      total: res?.total ?? (res?.items ? res.items.length : 0),
    }
  },
  getTasks: async (projectId, getToken) => {
    if (projectId) {
      const res = await api.listTasksByProject(projectId, {}, getToken)
      return res.items
    }
    const projects = await apiClient.get("/projects", { getToken })
    const all = []
    for (const proj of projects) {
      try {
        const t = await api.listTasksByProject(proj.id, {}, getToken)
        all.push(...(t.items || []))
      } catch {
        // ignore
      }
    }
    return all
  },
  createTask: (projectId, payload, getToken) => apiClient.post(`/projects/${projectId}/tasks`, payload, { getToken }),
  updateTask: (taskId, payload, getToken) => apiClient.patch(`/tasks/${taskId}`, payload, { getToken }),
  deleteTask: (taskId, getToken) => apiClient.delete(`/tasks/${taskId}`, { getToken }),

  statusLabels,
}

export default api
