import { Link, NavLink } from 'react-router-dom'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const ROLE_KEY = 'devcare_role'

function getIsAuthenticated() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
}

function Navbar() {
  const isAuthenticated = getIsAuthenticated()
  const role = localStorage.getItem(ROLE_KEY)

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem('devcare_refresh_token')
    localStorage.removeItem('devcare_username')
    localStorage.removeItem(ROLE_KEY)
    window.location.href = '/'
  }

  const navItems = isAuthenticated
    ? [
        { label: role === 'doctor' ? 'Doctor' : 'Patient', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
      ]
    : []

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(242,250,248,0.9)] backdrop-blur">
      <nav className="site-container flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          DevCare AI
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {isAuthenticated ? (
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        ) : (
          <a href="#contact" className="btn-primary">
            Get Started
          </a>
        )}
      </nav>
    </header>
  )
}

export default Navbar