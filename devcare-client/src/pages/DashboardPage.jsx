import { Link, useNavigate } from 'react-router-dom'

import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const USERNAME_KEY = 'devcare_username'

function DashboardPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem(USERNAME_KEY)
  const access = localStorage.getItem(ACCESS_TOKEN_KEY)
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)

  function handleLogout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main className="site-container flex min-h-[calc(100vh-4rem)] items-center py-10">
        <div className="elevated-card w-full rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 sm:px-10">
          {access ? (
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  User Dashboard
                </p>
                <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Welcome back, {username || 'User'}
                </h1>
                <p className="mt-4 max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
                  This page shows a basic authenticated state for your hackathon
                  demo. Replace these summary cards with real patient or model
                  metrics later.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button type="button" className="btn-primary" onClick={handleLogout}>
                    Logout
                  </button>
                  <Link to="/" className="btn-secondary">
                    Back to landing
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
                  <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                    Current session
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-[var(--color-text)]">
                    {access}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
                  <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                    Refresh token
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-[var(--color-text)]">
                    {refresh || 'No refresh token stored'}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
                  <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                    Quick links
                  </p>
                  <h1>
                    History
                  </h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                Access Required
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Please login to continue
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-text-muted)] sm:text-lg">
                Your session is not available yet. Go to the login page or create
                a new account.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
                <Link to="/register" className="btn-secondary">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default DashboardPage