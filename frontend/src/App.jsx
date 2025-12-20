import React from "react"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/clerk-react"
import { BrowserRouter } from "react-router-dom"
import Layout from "./components/layout/Layout"
import AppRoutes from "./routes/AppRoutes"

function App() {
  return (
    <BrowserRouter>
      <SignedOut>
        <div className="signed-out">
          <div className="auth-card">
            <div className="brand-mark">PM</div>
            <h3 className="section-title">Project Management Tracker</h3>
            <div className="muted">A calm, modern workspace for your projects and tasks.</div>
            <div className="cta-row">
              <SignInButton mode="modal">
                <button type="button" className="primary-btn">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button type="button" className="subtle-btn">
                  Create account
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <Layout>
          <AppRoutes />
        </Layout>
      </SignedIn>
    </BrowserRouter>
  )
}

export default App
