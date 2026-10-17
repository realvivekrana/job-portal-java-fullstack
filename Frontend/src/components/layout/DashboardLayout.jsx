import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import Brand from '../common/Brand'
import Icon from '../common/Icon'
import { initials } from '../../utils/helpers'
import { SIDEBAR, isItemActive, roleLabel, titleFor } from './navConfig'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const groups = SIDEBAR[user.role] || []

  // Esc closes the drawer; lock page scroll while it is open on small screens
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dash">
      <div className={`sidebar-backdrop${open ? ' show' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Sidebar">
        <div className="sidebar-head">
          <Brand to="/" light />
          <button type="button" className="sidebar-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Icon name="x" size={22} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {groups.map((g) => (
            <div className="nav-group" key={g.label}>
              <div className="nav-group-label">{g.label}</div>
              {g.items.map((item) => {
                const active = isItemActive(item, pathname)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`side-link${active ? ' active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon name={item.icon} size={19} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="side-user">
            <span className="avatar">{initials(user.name)}</span>
            <div>
              <strong>{user.name}</strong>
              <span className="role">{roleLabel(user.role)}</span>
            </div>
          </div>
          <button type="button" className="side-logout" onClick={handleLogout}>
            <Icon name="logout" size={17} /> Log out
          </button>
        </div>
      </aside>

      <div className="dash-main">
        <header className="topbar">
          <div className="topbar-left">
            <button type="button" className="icon-btn menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
              <Icon name="menu" size={20} />
            </button>
            <span className="topbar-title">{titleFor(pathname)}</span>
          </div>
          <div className="topbar-right">
            <Link to="/" className="btn btn-outline btn-sm">
              <Icon name="home" size={16} /> Home
            </Link>
            <div className="topbar-user">
              <span className="avatar">{initials(user.name)}</span>
            </div>
          </div>
        </header>

        <main className="dash-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}