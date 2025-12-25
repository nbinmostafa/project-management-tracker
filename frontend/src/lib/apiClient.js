const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://project-management-tracker-production.up.railway.app"

async function request(path, { method = "GET", body, headers = {}, getToken } = {}) {
  const token = getToken ? await getToken() : null
  let res
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    const error = new Error(`Network error: ${err?.message || "Failed to fetch"}`)
    error.cause = err
    throw error
  }

  if (!res.ok) {
    let message = res.statusText || "Request failed"
    try {
      const data = await res.json()
      if (data?.detail) message = Array.isArray(data.detail) ? data.detail.map((d) => d.msg || d).join(", ") : data.detail
    } catch {}
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  if (res.status === 204) return null
  return res.json()
}

export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
  baseUrl: API_BASE_URL,
}

export default apiClient
