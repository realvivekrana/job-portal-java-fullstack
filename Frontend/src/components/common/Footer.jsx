import { Link } from 'react-router-dom'
import Brand from './Brand'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand light />
            <p className="small" style={{ marginTop: '.85rem', maxWidth: 340 }}>
              A simple place for candidates to find the right job and for recruiters to hire the right people.
            </p>
          </div>
          <div>
            <h4>For candidates</h4>
            <ul>
              <li><Link to="/jobs">Browse jobs</Link></li>
              <li><Link to="/register">Create a profile</Link></li>
              <li><Link to="/login">Log in</Link></li>
            </ul>
          </div>
          <div>
            <h4>For recruiters</h4>
            <ul>
              <li><Link to="/register?role=recruiter">Post a job</Link></li>
              <li><Link to="/login">Recruiter log in</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} JobPortal. All rights reserved.</span>
          <span>Made in India</span>
        </div>
      </div>
    </footer>
  )
}