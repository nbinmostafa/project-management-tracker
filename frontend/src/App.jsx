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
          <div className="signed-out__backdrop">
            <div className="orb orb--one" />
            <div className="orb orb--two" />
            <div className="grid-lines" />
          </div>

          <div className="landing-grid">
            <div className="landing-copy">
              <div className="pill pill--ghost">Modern workspace for projects</div>

              <h1 className="landing-title">Project Management Tracker</h1>

              <p className="landing-subtitle">
                Keep teams aligned with a clean, fast workspace for projects, tasks, and delivery - built for clarity from day one.
              </p>

              <div className="landing-stats">
                <div className="landing-stat">
                  <div className="stat-label">Stay organized</div>
                  <div className="stat-value">Projects & tasks, in one place</div>
                  <div className="stat-hint">Track what matters without noise - ownership, progress, and next steps.</div>
                </div>

                <div className="landing-stat">
                  <div className="stat-label">Move faster</div>
                  <div className="stat-value">Visual workflows that teams love</div>
                  <div className="stat-hint">A board that makes progress obvious and keeps work moving.</div>
                </div>

                <div className="landing-stat">
                  <div className="stat-label">Built for execution</div>
                  <div className="stat-value">Focused UI, quick updates</div>
                  <div className="stat-hint">Spend less time managing work and more time shipping.</div>
                </div>
              </div>

              <div className="landing-trust">
                <div className="muted" style={{ marginTop: 18 }}>
                  Secure sign-in powered by Clerk.
                </div>
              </div>
            </div>

            <div className="auth-card auth-card--glass">
              <div className="auth-card__header">
                <div className="brand-mark">PM</div>
                <div className="chip chip-ghost">Welcome</div>
              </div>

              <h3 className="section-title">Sign in to your workspace</h3>
              <div className="muted">Access your projects, tasks, and workflow in seconds.</div>

              <div className="auth-insights" style={{ marginTop: 16 }}>
                <div className="insight-row">
                  <span className="tiny-dot indigo" />
                  <div>
                    <div className="insight-title">Clean dashboards</div>
                    <div className="muted">A calm interface your team will actually use.</div>
                  </div>
                </div>

                <div className="insight-row">
                  <span className="tiny-dot emerald" />
                  <div>
                    <div className="insight-title">Real-time momentum</div>
                    <div className="muted">See progress clearly across projects and tasks.</div>
                  </div>
                </div>

                <div className="insight-row">
                  <span className="tiny-dot amber" />
                  <div>
                    <div className="insight-title">Built for teams</div>
                    <div className="muted">Simple enough to start, structured enough to scale.</div>
                  </div>
                </div>
              </div>

              <div className="cta-row" style={{ marginTop: 18 }}>
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

              <div className="auth-footnote muted" style={{ marginTop: 14 }}>
                By continuing, you agree to our Terms and Privacy Policy.
              </div>
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
