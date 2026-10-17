import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import useSite from '../../hooks/useSite'
import { ROLE_HOME, ROLES } from '../../utils/constants'
import Brand from './Brand'

export default function Footer() {
  const { site } = useSite()
  const { isAuthenticated, user } = useAuth()
  const loggedIn = isAuthenticated && user
  const dashboard = loggedIn ? ROLE_HOME[user.role] || '/' : null

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand light />
            <p className="small" style={{ marginTop: '.85rem', maxWidth: 340 }}>{site.footerAbout}</p>
            {site.contactEmail && (
              <p className="small"><a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></p>
            )}
          </div>
          <div>
            <h4>For candidates</h4>
            <ul>
              <li><Link to="/jobs">Browse jobs</Link></li>
              {loggedIn ? (
                <li><Link to={dashboard}>My dashboard</Link></li>
              ) : (
                <>
                  <li><Link to="/register">Create a profile</Link></li>
                  <li><Link to="/login">Log in</Link></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4>For recruiters</h4>
            <ul>
              {loggedIn && user.role === ROLES.RECRUITER ? (
                <>
                  <li><Link to="/recruiter/jobs/new">Post a job</Link></li>
                  <li><Link to="/recruiter/jobs">My jobs</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/register?role=recruiter">Post a job</Link></li>
                  {!loggedIn && <li><Link to="/login">Recruiter log in</Link></li>}
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {site.siteName}. All rights reserved.</span>
          {site.footerNote && <span>{site.footerNote}</span>}
        </div>
      </div>
    </footer>
  )
}