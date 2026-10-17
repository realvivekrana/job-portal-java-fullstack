import { Link, Outlet } from 'react-router-dom'
import Brand from '../common/Brand'
import Icon from '../common/Icon'

const POINTS = [
  'Search openings and apply with one saved resume',
  'Post jobs and shortlist applicants in one place',
  'Get email updates when your application status changes',
]

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Brand light />
        <div>
          <h2>Your next role, or your next hire, starts here.</h2>
          <ul>
            {POINTS.map((p) => (
              <li key={p}><Icon name="check" size={18} /> <span>{p}</span></li>
            ))}
          </ul>
        </div>
        <span className="small">© {new Date().getFullYear()} JobPortal</span>
      </aside>

      <div className="auth-main">
        <div className="auth-top">
          <Brand />
          <Link to="/" className="btn btn-ghost btn-sm"><Icon name="arrowL" size={16} /> Back to home</Link>
        </div>
        <div className="auth-center">
          <Outlet />
        </div>
      </div>
    </div>
  )
}