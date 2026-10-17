import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { ROLES } from '../../utils/constants'
import { initials } from '../../utils/helpers'

const LINKS = {
  [ROLES.CANDIDATE]: [
    { to: '/candidate/dashboard', label: 'Dashboard' },
    { to: '/candidate/applications', label: 'My Applications' },
    { to: '/candidate/profile', label: 'My Profile' },
  ],
  [ROLES.RECRUITER]: [
    { to: '/recruiter/dashboard', label: 'Dashboard' },
    { to: '/recruiter/jobs', label: 'My Jobs' },
    { to: '/recruiter/jobs/new', label: 'Post a Job' },
    { to: '/recruiter/company', label: 'Company' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/jobs', label: 'Jobs' },
  ],
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const close = () => setOpen(false)

  const handleLogout = () => {
    close()
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`
  const roleLinks = isAuthenticated ? LINKS[user.role] || [] : []

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">J</span> JobPortal
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className={`nav-menu${open ? ' open' : ''}`}>
          <div className="nav-links">
            <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
            <NavLink to="/jobs" className={linkClass} onClick={close}>Find Jobs</NavLink>
            {roleLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end className={linkClass} onClick={close}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <div className="nav-user">
                  <span className="avatar">{initials(user.name)}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <br />
                    <span className="muted small">{user.role.charAt(0) + user.role.slice(1).toLowerCase()}</span>
                  </span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm" onClick={close}>Login</Link>
                <Link to="/register" className="btn btn-sm" onClick={close}>Sign up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}