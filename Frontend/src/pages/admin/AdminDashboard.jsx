import { Link } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import SegmentBar from '../../components/common/SegmentBar'
import Icon from '../../components/common/Icon'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import useApi from '../../hooks/useApi'
import { getAdminStats } from '../../api/authApi'

export default function AdminDashboard() {
  const { data: s, error, loading, reload } = useApi(() => getAdminStats(), [])

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1>Admin dashboard</h1>
          <p>Platform overview.</p>
        </div>
        <div className="row">
          <Link to="/admin/users" className="btn btn-outline"><Icon name="users" size={17} /> Manage users</Link>
          <Link to="/admin/jobs" className="btn btn-outline"><Icon name="briefcase" size={17} /> Manage jobs</Link>
        </div>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !s && <Loader />}
      {s && (
        <>
          <section className="stack">
            <h3 style={{ margin: 0 }}>Users</h3>
            <div className="stat-grid cols-4">
              <StatCard label="Total users" value={s.totalUsers} icon="users" />
              <StatCard label="Candidates" value={s.candidates} accent="green" icon="user" />
              <StatCard label="Recruiters" value={s.recruiters} accent="amber" icon="building" />
              <StatCard label="Admins" value={s.admins} accent="red" icon="shield" />
            </div>
            <div className="card">
              <div className="card-head"><h3>User mix</h3></div>
              <SegmentBar
                segments={[
                  { label: 'Candidates', value: s.candidates, color: '#15803d' },
                  { label: 'Recruiters', value: s.recruiters, color: '#f0a030' },
                  { label: 'Admins', value: s.admins, color: '#c2362b' },
                ]}
              />
            </div>
          </section>

          <section className="stack">
            <h3 style={{ margin: 0 }}>Jobs and applications</h3>
            <div className="stat-grid cols-6">
              <StatCard label="Total jobs" value={s.totalJobs} icon="briefcase" />
              <StatCard label="Active jobs" value={s.activeJobs} accent="green" icon="check" />
              <StatCard label="Applications" value={s.totalApplications} icon="send" />
              <StatCard label="Shortlisted" value={s.shortlisted} accent="amber" icon="star" />
              <StatCard label="Hired" value={s.hired} accent="green" icon="award" />
              <StatCard label="Rejected" value={s.rejected} accent="red" icon="xCircle" />
            </div>
          </section>
        </>
      )}
    </div>
  )
}