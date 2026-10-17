import { Link } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/application/StatusBadge'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import { getMyApplicationStats, getMyApplications } from '../../api/applicationApi'
import { getMyProfile } from '../../api/profileApi'
import { formatDate } from '../../utils/helpers'

export default function CandidateDashboard() {
  const { user } = useAuth()
  const stats = useApi(() => getMyApplicationStats(), [])
  const recent = useApi(() => getMyApplications({ page: 0, size: 5 }), [])
  const profile = useApi(() => getMyProfile(), [])

  const s = stats.data || {}
  const incomplete = profile.data && (!profile.data.resumeUrl || !profile.data.skills)

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Hello, {user.name.split(' ')[0]} 👋</h1>
          <p>Here is a quick look at your job search.</p>
        </div>
        <Link to="/jobs" className="btn">Find jobs</Link>
      </div>

      {incomplete && (
        <div className="alert alert-warning row row-between" style={{ marginBottom: '1.25rem' }}>
          <span>Complete your profile (skills and resume) so recruiters can see your best side.</span>
          <Link to="/candidate/profile" className="btn btn-sm">Update profile</Link>
        </div>
      )}

      {stats.error ? (
        <ErrorState error={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="stat-grid cols-4">
          <StatCard label="Total applications" value={s.total} />
          <StatCard label="Shortlisted" value={s.shortlisted} accent="amber" />
          <StatCard label="Hired" value={s.hired} accent="green" />
          <StatCard label="Rejected" value={s.rejected} accent="red" />
        </div>
      )}

      <section className="card">
        <div className="row row-between">
          <h3 className="card-title" style={{ margin: 0 }}>Recent applications</h3>
          <Link to="/candidate/applications" className="small">View all</Link>
        </div>

        {recent.loading && !recent.data && <Loader />}
        {recent.error && <ErrorState error={recent.error} onRetry={recent.reload} />}
        {recent.data && recent.data.content.length === 0 && (
          <EmptyState icon="📝" title="No applications yet" text="Find a job you like and apply in a few clicks.">
            <Link to="/jobs" className="btn">Browse jobs</Link>
          </EmptyState>
        )}
        {recent.data && recent.data.content.length > 0 && (
          <div className="table-wrap mt">
            <table>
              <thead>
                <tr><th>Job</th><th>Company</th><th>Applied</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.data.content.map((a) => (
                  <tr key={a.id}>
                    <td className="wrap"><Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link></td>
                    <td>{a.companyName}</td>
                    <td>{formatDate(a.appliedAt)}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}