import React, { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleNavigate = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <Sidebar onNavigate={handleNavigate} isOpen={isSidebarOpen} />
      <div className="main-area">
        <Topbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <div className="content">{children}</div>
      </div>
    </div>
  )
}

export default Layout
