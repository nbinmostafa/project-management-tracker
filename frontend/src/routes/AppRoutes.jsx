import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Dashboard from "../pages/Dashboard"
import Projects from "../pages/Projects"
import ProjectDetail from "../pages/ProjectDetail"
import Tasks from "../pages/Tasks"
import DebugApi from "../pages/DebugApi"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:projectId" element={<ProjectDetail />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/debug/api" element={<DebugApi />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
