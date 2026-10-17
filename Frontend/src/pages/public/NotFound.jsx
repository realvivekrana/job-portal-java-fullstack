import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container page">
      <div className="empty">
        <div className="empty-icon">🧭</div>
        <h1>404 - Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn">Go home</Link>
          <Link to="/jobs" className="btn btn-outline">Browse jobs</Link>
        </div>
      </div>
    </div>
  )
}