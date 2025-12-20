import React from "react"

function StatCard({ title, value, hint, icon, accent = "indigo" }) {
  return (
    <div className="card stat-card" data-accent={accent}>
      <div className="stat-header">
        <div>
          <div className="muted">{title}</div>
          <div className="stat-value">{value}</div>
        </div>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="muted">{hint}</div>
    </div>
  )
}

export default StatCard
