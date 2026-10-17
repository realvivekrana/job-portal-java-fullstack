import { Link, Outlet } from 'react-router-dom'
import Brand from '../common/Brand'
import Icon from '../common/Icon'
import useSite from '../../hooks/useSite'
import { lines } from '../../utils/helpers'

export default function AuthLayout() {
  const { site } = useSite()
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Brand light />
        <div>
          <h2>{site.authHeadline}</h2>
          <ul>
            {lines(site.authPoints).map((p) => (
              <li key={p}><Icon name="check" size={18} /> <span>{p}</span></li>
            ))}
          </ul>
        </div>
        <span className="small">© {new Date().getFullYear()} {site.siteName}</span>
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