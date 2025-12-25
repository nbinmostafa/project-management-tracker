import React, { useState } from "react"
import { useAuth, SignedIn } from "@clerk/clerk-react"
import { apiClient } from "../lib/apiClient"

function DebugApi() {
  const { getToken } = useAuth()
  const [status, setStatus] = useState("idle")
  const [message, setMessage] = useState("")

  const check = async () => {
    setStatus("loading")
    setMessage("")
    try {
      const data = await apiClient.get("/health")
      setStatus("success")
      setMessage(JSON.stringify(data))
    } catch (err) {
      setStatus("error")
      setMessage(err?.message || "Request failed")
    }
  }

  return (
    <SignedIn>
      <div className="page-shell">
        <div className="page-header">
          <div>
            <h2 className="page-title">API Connection Check</h2>
            <p className="page-subtitle">Calls /health on the deployed backend</p>
          </div>
          <button type="button" className="ghost-btn" onClick={check} disabled={status === "loading"}>
            {status === "loading" ? "Checking..." : "Run check"}
          </button>
        </div>
        <div className="panel">
          {status === "idle" && <div className="muted">Press "Run check" to call the API.</div>}
          {status === "success" && <div className="badge success">Success</div>}
          {status === "error" && <div className="badge warning">Error</div>}
          {message && <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message}</pre>}
        </div>
      </div>
    </SignedIn>
  )
}

export default DebugApi
