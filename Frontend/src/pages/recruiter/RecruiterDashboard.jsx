import { Link } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import SegmentBar from '../../components/common/SegmentBar'
import Icon from '../../components/common/Icon'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import { getRecruiterStats } from '../../api/applicationApi'
import { getMyJobs } from '../../api/jobApi'
import { getMyCompany } from '../../api/companyApi'
import { formatDate, jobTypeLabel } from '../../utils/helpers'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const stats = useApi(() => getRecruiterStats(), [])
  const jobs = useApi(() => getMyJobs({ page: 0, size: 5 }), [])
  const company = useApi(() => getMyCompany().catch((e) => (e.response?.status === 404 ? null : Promise.reject(e))), [])
  const s = stats.data || {}
  const applied = Math.max((s.totalApplications || 0) - (s.shortlisted || 0) - (s.hired || 0) - (s.rejected || 0), 0)

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1>Hello, {user.name.split(' ')[0]}</h1>
          <p>Manage your jobs and review applicants.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn"><Icon name="plus" size={17} /> Post a job</Link>
      </div>

      {company.data === null && !company.loading && (
        <div className="alert alert-warning row-between">
          <span>Create your company profile before posting jobs.</span>
          <Link to="/recruiter/company" className="btn btn-sm">Create company</Link>
        </div>
      )}

      {stats.error ? (
        <ErrorState error={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="stat-grid cols-6">
          <StatCard label="Total jobs" value={s.totalJobs} icon="briefcase" />
          <StatCard label="Active jobs" value={s.activeJobs} accent="green" icon="check" />
          <StatCard label="Applications" value={s.totalApplications} icon="send" />
          <StatCard label="Shortlisted" value={s.shortlisted} accent="amber" icon="star" />
          <StatCard label="Hired" value={s.hired} accent="green" icon="award" />
          <StatCard label="Rejected" value={s.rejected} accent="red" icon="xCircle" />
        </div>
      )}

      <div className="dash-grid two">
        <div className="stack">
          {s.totalApplications > 0 && (
            <section className="card">
              <div className="card-head"><h3>Hiring pipeline</h3></div>
              <SegmentBar
                segments={[
                  { label: 'New', value: applied, color: '#1d5fbf' },
                  { label: 'Shortlisted', value: s.shortlisted, color: '#f0a030' },
                  { label: 'Hired', value: s.hired, color: '#15803d' },
                  { label: 'Rejected', value: s.rejected, color: '#c2362b' },
                ]}
              />
            </section>
          )}

          <section className="card">
            <div className="card-head">
              <h3>Your recent jobs</h3>
              <Link to="/recruiter/jobs" className="small">View all</Link>
            </div>
            {jobs.loading && !jobs.data && <Loader />}
            {jobs.error && <ErrorState error={jobs.error} onRetry={jobs.reload} />}
            {jobs.data && jobs.data.content.length === 0 && (
              <EmptyState icon="briefcase" title="No jobs posted yet" text="Post your first job to start receiving applications.">
                <Link to="/recruiter/jobs/new" className="btn">Post a job</Link>
              </EmptyState>
            )}
            {jobs.data && jobs.data.content.length > 0 && (
              <div className="table-wrap">
                <table className="responsive">
                  <thead>
                    <tr><th>Title</th><th>Type</th><th>Posted</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {jobs.data.content.map((j) => (
                      <tr key={j.id}>
                        <td className="wrap" data-label="Title"><Link to={`/jobs/${j.id}`}>{j.title}</Link></td>
                        <td data-label="Type">{jobTypeLabel(j.jobType)}</td>
                        <td data-label="Posted">{formatDate(j.createdAt)}</td>
                        <td data-label="Status"><span className={`badge ${j.active ? 'badge-active' : 'badge-closed'}`}>{j.active ? 'Open' : 'Closed'}</span></td>
                        <td data-label=""><Link to={`/recruiter/jobs/${j.id}/applicants`} className="btn btn-outline btn-sm">Applicants</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="card">
          <div className="card-head"><h3>Quick actions</h3></div>
          <div className="quick-list">
            <Link to="/recruiter/jobs/new" className="quick-link"><Icon name="plus" size={18} /> Post a new job <Icon name="chevR" size={16} /></Link>
            <Link to="/recruiter/jobs" className="quick-link"><Icon name="briefcase" size={18} /> Manage my jobs <Icon name="chevR" size={16} /></Link>
            <Link to="/recruiter/company" className="quick-link"><Icon name="building" size={18} /> Company profile <Icon name="chevR" size={16} /></Link>
          </div>
        </section>
      </div>
    </div>
  )
}