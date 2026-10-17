import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { ROLE_HOME } from '../../utils/constants'
import { initials } from '../../utils/helpers'
import { roleLabel } from '../layout/navConfig'
import Brand from './Brand'
import Icon from './Icon'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const close = () => setOpen(false)

  // Mobile menu: Esc closes it, page behind doesn't scroll, auto-closes when resized to desktop
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onResize = () => window.innerWidth >= 1024 && setOpen(false)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = prev
    }
  }, [open])

  const handleLogout = () => {
    close()
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Brand onClick={close} />

        <button
          type="button"
          className="icon-btn nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'x' : 'menu'} size={20} />
        </button>

        <nav className={`nav-menu${open ? ' open' : ''}`} aria-label="Main">
          <div className="nav-links">
            <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
            <NavLink to="/jobs" className={linkClass} onClick={close}>Find jobs</NavLink>
            {user?.role === 'CANDIDATE' && (
              <>
                <NavLink to="/candidate/saved" className={linkClass} onClick={close}>Saved</NavLink>
                <NavLink to="/candidate/applications" className={linkClass} onClick={close}>Applied</NavLink>
              </>
            )}
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <div className="nav-user">
                  <span className="avatar">{initials(user.name)}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <br />
                    <span className="muted small">{roleLabel(user.role)}</span>
                  </span>
                </div>
                <Link to={ROLE_HOME[user.role] || '/'} className="btn btn-sm" onClick={close}>
                  <Icon name="dashboard" size={16} /> Dashboard
                </Link>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
                  <Icon name="logout" size={16} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="ij-signin" onClick={close}>Sign in</Link>
                <Link to="/register?role=recruiter" className="ij-employers" onClick={close}>Employers / Post a job</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}