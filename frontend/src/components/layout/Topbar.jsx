import React from "react"
import { UserButton } from "@clerk/clerk-react"

function Topbar({ onToggleSidebar }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button type="button" className="sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle navigation">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="title">Project Management Tracker</div>
      </div>
      <div className="right">
        <UserButton />
      </div>
    </div>
  )
}

export default Topbar
