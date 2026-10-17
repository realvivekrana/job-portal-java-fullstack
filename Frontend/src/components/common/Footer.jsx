import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>JobPortal</h4>
            <p className="small">
              A simple place for candidates to find great jobs and for recruiters to hire the right people.
            </p>
          </div>
          <div>
            <h4>Candidates</h4>
            <ul>
              <li><Link to="/jobs">Browse jobs</Link></li>
              <li><Link to="/register">Create profile</Link></li>
              <li><Link to="/login">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <h4>Recruiters</h4>
            <ul>
              <li><Link to="/register">Post a job</Link></li>
              <li><Link to="/login">Recruiter login</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} JobPortal. All rights reserved.</div>
      </div>
    </footer>
  )
}