import { Link } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import useApi from '../../hooks/useApi'
import { getAdminStats } from '../../api/authApi'

export default function AdminDashboard() {
  const { data: s, error, loading, reload } = useApi(() => getAdminStats(), [])

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Admin dashboard</h1>
          <p>Platform overview.</p>
        </div>
        <div className="row">
          <Link to="/admin/users" className="btn btn-outline">Manage users</Link>
          <Link to="/admin/jobs" className="btn btn-outline">Manage jobs</Link>
        </div>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !s && <Loader />}
      {s && (
        <>
          <h3>Users</h3>
          <div className="stat-grid cols-4">
            <StatCard label="Total users" value={s.totalUsers} />
            <StatCard label="Candidates" value={s.candidates} accent="green" />
            <StatCard label="Recruiters" value={s.recruiters} accent="amber" />
            <StatCard label="Admins" value={s.admins} accent="red" />
          </div>

          <h3>Jobs and applications</h3>
          <div className="stat-grid cols-6">
            <StatCard label="Total jobs" value={s.totalJobs} />
            <StatCard label="Active jobs" value={s.activeJobs} accent="green" />
            <StatCard label="Applications" value={s.totalApplications} />
            <StatCard label="Shortlisted" value={s.shortlisted} accent="amber" />
            <StatCard label="Hired" value={s.hired} accent="green" />
            <StatCard label="Rejected" value={s.rejected} accent="red" />
          </div>
        </>
      )}
    </div>
  )
}