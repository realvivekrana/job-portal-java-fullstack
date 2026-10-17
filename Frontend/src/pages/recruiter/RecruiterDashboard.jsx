import { Link } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
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

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Hello, {user.name.split(' ')[0]} 👋</h1>
          <p>Manage your jobs and review applicants.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn">+ Post a job</Link>
      </div>

      {company.data === null && !company.loading && (
        <div className="alert alert-warning row row-between" style={{ marginBottom: '1.25rem' }}>
          <span>Create your company profile before posting jobs.</span>
          <Link to="/recruiter/company" className="btn btn-sm">Create company</Link>
        </div>
      )}

      {stats.error ? (
        <ErrorState error={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="stat-grid cols-6">
          <StatCard label="Total jobs" value={s.totalJobs} />
          <StatCard label="Active jobs" value={s.activeJobs} accent="green" />
          <StatCard label="Applications" value={s.totalApplications} />
          <StatCard label="Shortlisted" value={s.shortlisted} accent="amber" />
          <StatCard label="Hired" value={s.hired} accent="green" />
          <StatCard label="Rejected" value={s.rejected} accent="red" />
        </div>
      )}

      <section className="card">
        <div className="row row-between">
          <h3 style={{ margin: 0 }}>Your recent jobs</h3>
          <Link to="/recruiter/jobs" className="small">View all</Link>
        </div>
        {jobs.loading && !jobs.data && <Loader />}
        {jobs.error && <ErrorState error={jobs.error} onRetry={jobs.reload} />}
        {jobs.data && jobs.data.content.length === 0 && (
          <EmptyState icon="💼" title="No jobs posted yet" text="Post your first job to start receiving applications.">
            <Link to="/recruiter/jobs/new" className="btn">Post a job</Link>
          </EmptyState>
        )}
        {jobs.data && jobs.data.content.length > 0 && (
          <div className="table-wrap mt">
            <table>
              <thead>
                <tr><th>Title</th><th>Type</th><th>Posted</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {jobs.data.content.map((j) => (
                  <tr key={j.id}>
                    <td className="wrap"><Link to={`/jobs/${j.id}`}>{j.title}</Link></td>
                    <td>{jobTypeLabel(j.jobType)}</td>
                    <td>{formatDate(j.createdAt)}</td>
                    <td><span className={`badge ${j.active ? 'badge-active' : 'badge-closed'}`}>{j.active ? 'Open' : 'Closed'}</span></td>
                    <td><Link to={`/recruiter/jobs/${j.id}/applicants`} className="btn btn-outline btn-sm">Applicants</Link></td>
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