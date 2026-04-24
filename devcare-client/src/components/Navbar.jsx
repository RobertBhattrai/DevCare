import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Login', href: '/login' },
  { label: 'Register', href: '/register' },
  { label: 'Dashboard', href: '/dashboard' },
]

function Navbar() {
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

        <Link to="/register" className="btn-primary">
          Request Demo
        </Link>
      </nav>
    </header>
  )
}

export default Navbar