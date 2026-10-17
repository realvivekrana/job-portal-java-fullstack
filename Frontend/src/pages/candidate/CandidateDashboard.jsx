import { Link } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import SegmentBar from '../../components/common/SegmentBar'
import Icon from '../../components/common/Icon'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/application/StatusBadge'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import { getMyApplicationStats, getMyApplications } from '../../api/applicationApi'
import { getMyProfile } from '../../api/profileApi'
import { formatDate } from '../../utils/helpers'

const CHECKS = [
  ['phone', 'Phone number'],
  ['location', 'Location'],
  ['skills', 'Skills'],
  ['experience', 'Experience'],
  ['education', 'Education'],
  ['resumeUrl', 'Resume uploaded'],
]

export default function CandidateDashboard() {
  const { user } = useAuth()
  const stats = useApi(() => getMyApplicationStats(), [])
  const recent = useApi(() => getMyApplications({ page: 0, size: 5 }), [])
  const profile = useApi(() => getMyProfile(), [])

  const s = stats.data || {}
  const p = profile.data
  const done = p ? CHECKS.filter(([k]) => Boolean(p[k])).length : 0
  const percent = Math.round((done / CHECKS.length) * 100)
  const applied = Math.max((s.total || 0) - (s.shortlisted || 0) - (s.hired || 0) - (s.rejected || 0), 0)

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1>Hello, {user.name.split(' ')[0]}</h1>
          <p>Here is a quick look at your job search.</p>
        </div>
        <Link to="/jobs" className="btn"><Icon name="search" size={17} /> Find jobs</Link>
      </div>

      {stats.error ? (
        <ErrorState error={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="stat-grid cols-4">
          <StatCard label="Total applications" value={s.total} icon="send" />
          <StatCard label="Shortlisted" value={s.shortlisted} accent="amber" icon="star" />
          <StatCard label="Hired" value={s.hired} accent="green" icon="award" />
          <StatCard label="Rejected" value={s.rejected} accent="red" icon="xCircle" />
        </div>
      )}

      <div className="dash-grid two">
        <div className="stack">
          {s.total > 0 && (
            <section className="card">
              <div className="card-head"><h3>Application pipeline</h3></div>
              <SegmentBar
                segments={[
                  { label: 'Applied', value: applied, color: '#1d5fbf' },
                  { label: 'Shortlisted', value: s.shortlisted, color: '#f0a030' },
                  { label: 'Hired', value: s.hired, color: '#15803d' },
                  { label: 'Rejected', value: s.rejected, color: '#c2362b' },
                ]}
              />
            </section>
          )}

          <section className="card">
            <div className="card-head">
              <h3>Recent applications</h3>
              <Link to="/candidate/applications" className="small">View all</Link>
            </div>

            {recent.loading && !recent.data && <Loader />}
            {recent.error && <ErrorState error={recent.error} onRetry={recent.reload} />}
            {recent.data && recent.data.content.length === 0 && (
              <EmptyState icon="send" title="No applications yet" text="Find a job you like and apply in a few taps.">
                <Link to="/jobs" className="btn">Browse jobs</Link>
              </EmptyState>
            )}
            {recent.data && recent.data.content.length > 0 && (
              <div className="table-wrap">
                <table className="responsive">
                  <thead>
                    <tr><th>Job</th><th>Company</th><th>Applied</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {recent.data.content.map((a) => (
                      <tr key={a.id}>
                        <td className="wrap" data-label="Job"><Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link></td>
                        <td data-label="Company">{a.companyName}</td>
                        <td data-label="Applied">{formatDate(a.appliedAt)}</td>
                        <td data-label="Status"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="stack">
          {p && (
            <section className="card">
              <div className="card-head">
                <h3>Profile strength</h3>
                <strong>{percent}%</strong>
              </div>
              <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${percent}%` }} />
              </div>
              <ul className="checklist">
                {CHECKS.map(([k, label]) => (
                  <li key={k} className={p[k] ? 'done' : ''}>
                    <span className="dot">{p[k] && <Icon name="check" size={11} strokeWidth={3} />}</span>
                    {label}
                  </li>
                ))}
              </ul>
              {percent < 100 && (
                <Link to="/candidate/profile" className="btn btn-outline btn-block mt">Complete profile</Link>
              )}
            </section>
          )}

          <section className="card">
            <div className="card-head"><h3>Quick actions</h3></div>
            <div className="quick-list">
              <Link to="/jobs" className="quick-link"><Icon name="search" size={18} /> Browse new jobs <Icon name="chevR" size={16} /></Link>
              <Link to="/candidate/applications" className="quick-link"><Icon name="send" size={18} /> My applications <Icon name="chevR" size={16} /></Link>
              <Link to="/candidate/profile" className="quick-link"><Icon name="file" size={18} /> Update resume <Icon name="chevR" size={16} /></Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}