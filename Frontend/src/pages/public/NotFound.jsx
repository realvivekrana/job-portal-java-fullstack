import { Link } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState icon="search" title="Page not found" text="The page you are looking for does not exist or has moved.">
        <div className="row">
          <Link to="/" className="btn">Go home</Link>
          <Link to="/jobs" className="btn btn-outline">Browse jobs</Link>
        </div>
      </EmptyState>
    </div>
  )
}