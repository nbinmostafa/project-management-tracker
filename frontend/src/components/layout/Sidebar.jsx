import React from "react"
import { NavLink } from "react-router-dom"

const navItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "projects",
    label: "Projects",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="6" r="1.2" fill="currentColor" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        <circle cx="16" cy="18" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="1.8" />
        <path d="M8 9.5h5.5M8 14.5h8" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

const navPaths = {
  dashboard: "/dashboard",
  projects: "/projects",
  tasks: "/tasks",
}

function Sidebar({ onNavigate, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-mark">PM</div>
        <div className="brand-text">
          <div className="brand-title">Project Management</div>
          <div className="brand-subtitle">Tracker</div>
        </div>
      </div>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={navPaths[item.key]}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={onNavigate}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">Crafted workspace for teams.</div>
    </aside>
  )
}

export default Sidebar
