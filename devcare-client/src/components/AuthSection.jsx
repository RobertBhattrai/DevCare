import { useMemo, useState } from 'react'

import { loginUser, registerUser } from '../api/authApi'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const USERNAME_KEY = 'devcare_username'

function getStoredAuth() {
  return {
    access: localStorage.getItem(ACCESS_TOKEN_KEY),
    refresh: localStorage.getItem(REFRESH_TOKEN_KEY),
    username: localStorage.getItem(USERNAME_KEY),
  }
}

function AuthSection() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [auth, setAuth] = useState(getStoredAuth)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const isAuthenticated = Boolean(auth.access)

  const accessPreview = useMemo(() => {
    if (!auth.access) {
      return ''
    }

    return `${auth.access.slice(0, 24)}...`
  }, [auth.access])

  function storeAuth(access, refresh, username) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    localStorage.setItem(USERNAME_KEY, username)

    setAuth({ access, refresh, username })
  }

  function clearAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    setAuth({ access: null, refresh: null, username: null })
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'register') {
        const registerData = await registerUser({
          username: form.username,
          email: form.email,
          password: form.password,
          password_confirm: form.confirmPassword,
        })

        storeAuth(
          registerData.access,
          registerData.refresh,
          registerData.user.username
        )
        setSuccess('Registration successful. You are logged in.')
      } else {
        const loginData = await loginUser({
          username: form.username,
          password: form.password,
        })

        storeAuth(loginData.access, loginData.refresh, form.username)
        setSuccess('Login successful.')
      }

      setForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setSuccess('')
  }

  return (
    <section id="contact" className="site-container pb-20">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 sm:px-9">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            Auth Demo
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Test login and registration flow
          </h2>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
            Use this section to validate frontend to backend JWT authentication.
            You can swap this with your final product screens later.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#home" className="btn-primary">
              Back to top
            </a>
            <a href="#features" className="btn-secondary">
              View sections
            </a>
          </div>
        </article>

        <article className="elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                Logged In
              </p>
              <h3 className="text-2xl font-bold">
                Welcome, {auth.username || 'User'}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Access token preview:
              </p>
              <p className="break-all rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                {accessPreview}
              </p>
              <button type="button" className="btn-secondary" onClick={clearAuth}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-2 rounded-full bg-[var(--color-surface-soft)] p-1">
                <button
                  type="button"
                  className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`}
                  onClick={() => switchMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`auth-tab ${mode === 'register' ? 'auth-tab-active' : ''}`}
                  onClick={() => switchMode('register')}
                >
                  Register
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="auth-label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={updateField}
                  className="auth-input"
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                />

                {mode === 'register' && (
                  <>
                    <label className="auth-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      className="auth-input"
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                    />
                  </>
                )}

                <label className="auth-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateField}
                  className="auth-input"
                  placeholder="Enter password"
                  autoComplete={
                    mode === 'register' ? 'new-password' : 'current-password'
                  }
                  required
                />

                {mode === 'register' && (
                  <>
                    <label className="auth-label" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={updateField}
                      className="auth-input"
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                    />
                  </>
                )}

                {error && <p className="auth-message auth-message-error">{error}</p>}
                {success && (
                  <p className="auth-message auth-message-success">{success}</p>
                )}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading
                    ? 'Please wait...'
                    : mode === 'register'
                      ? 'Create account'
                      : 'Login'}
                </button>
              </form>
            </>
          )}
        </article>
      </div>
    </section>
  )
}

export default AuthSection