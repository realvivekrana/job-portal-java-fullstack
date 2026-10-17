import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import BackButton from '../../components/common/BackButton'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import JobDetails, { JobSummary } from '../../components/job/JobDetails'
import ApplyModal from '../../components/application/ApplyModal'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import { getJob } from '../../api/jobApi'
import { getCompany } from '../../api/companyApi'
import { ROLES } from '../../utils/constants'
import { fileUrl, formatSalary, initials, jobTypeLabel } from '../../utils/helpers'

export default function JobDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const { data: job, error, loading, reload } = useApi(() => getJob(id), [id])
  const companyId = job?.companyId
  const { data: company } = useApi(
    () => (companyId ? getCompany(companyId).catch(() => null) : Promise.resolve(null)),
    [companyId],
  )

  if (loading && !job) return <Loader page text="Loading job..." />
  if (error) {
    const notFound = error.response?.status === 404
    return (
      <div className="container page">
        <BackButton fallback="/jobs" />
        {notFound ? (
          <div className="empty">
            <div className="empty-icon">🫥</div>
            <h3>Job not found</h3>
            <p>This job may have been removed.</p>
            <Link to="/jobs" className="btn">Browse jobs</Link>
          </div>
        ) : (
          <ErrorState error={error} onRetry={reload} />
        )}
      </div>
    )
  }
  if (!job) return null

  const logo = fileUrl(company?.logo)

  const renderAction = () => {
    if (!job.active) return <div className="alert alert-warning">This job is no longer accepting applications.</div>
    if (!isAuthenticated) {
      return (
        <Link to="/login" state={{ from: location.pathname }} className="btn btn-block">
          Login to apply
        </Link>
      )
    }
    if (user.role !== ROLES.CANDIDATE) {
      return <div className="alert alert-info">Only candidate accounts can apply for jobs.</div>
    }
    if (applied) {
      return (
        <div className="stack">
          <div className="alert alert-success">Application submitted. Good luck!</div>
          <Link to="/candidate/applications" className="btn btn-outline btn-block">Track my applications</Link>
        </div>
      )
    }
    return <button className="btn btn-block" onClick={() => setApplying(true)}>Apply now</button>
  }

  return (
    <div className="container page">
      <BackButton fallback="/jobs" />

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="logo-box">
          <span className="avatar avatar-lg">
            {logo ? <img src={logo} alt={`${job.companyName} logo`} /> : initials(job.companyName)}
          </span>
          <div>
            <h1 style={{ margin: 0 }}>{job.title}</h1>
            <p className="muted" style={{ margin: 0 }}>
              {job.companyName} · {job.location} · {jobTypeLabel(job.jobType)}
            </p>
            <p style={{ margin: '.25rem 0 0', fontWeight: 600 }}>💰 {formatSalary(job.salaryMin, job.salaryMax)}</p>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <JobDetails job={job} />

        <aside className="stack">
          <div className="card">
            {renderAction()}
            <div className="mt"><JobSummary job={job} /></div>
          </div>

          {company && (
            <div className="card">
              <h3 className="card-title">About {company.name}</h3>
              {company.description && <p className="small pre-line break">{company.description}</p>}
              <ul className="info-list">
                {company.location && <li><span>Location</span><span>{company.location}</span></li>}
                {company.website && (
                  <li>
                    <span>Website</span>
                    <span>
                      <a href={/^https?:\/\//i.test(company.website) ? company.website : `https://${company.website}`}
                        target="_blank" rel="noopener noreferrer">Visit site</a>
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {applying && (
        <ApplyModal
          job={job}
          onClose={() => setApplying(false)}
          onApplied={() => {
            setApplying(false)
            setApplied(true)
          }}
        />
      )}
    </div>
  )
}