import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import BackButton from '../../components/common/BackButton'
import Icon from '../../components/common/Icon'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import JobDetails, { JobSummary } from '../../components/job/JobDetails'
import ApplyModal from '../../components/application/ApplyModal'
import SaveButton from '../../components/job/SaveButton'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import { getJob } from '../../api/jobApi'
import { getCompany } from '../../api/companyApi'
import { ROLES } from '../../utils/constants'
import { fileUrl, formatSalary, initials, jobTypeLabel, timeAgo } from '../../utils/helpers'

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
          <EmptyState icon="search" title="Job not found" text="This job may have been removed.">
            <Link to="/jobs" className="btn">Browse jobs</Link>
          </EmptyState>
        ) : (
          <ErrorState error={error} onRetry={reload} />
        )}
      </div>
    )
  }
  if (!job) return null

  const logo = fileUrl(company?.logo)
  const canApply = job.active && isAuthenticated && user.role === ROLES.CANDIDATE && !applied
  const guestCanApply = job.active && !isAuthenticated
  const showBar = canApply || guestCanApply

  const renderAction = () => {
    if (!job.active) return <div className="alert alert-warning">This job is no longer accepting applications.</div>
    if (!isAuthenticated) {
      return (
        <Link to="/login" state={{ from: location.pathname }} className="btn btn-block btn-lg">
          Log in to apply
        </Link>
      )
    }
    if (user.role !== ROLES.CANDIDATE) {
      return <div className="alert alert-info">Only candidate accounts can apply for jobs.</div>
    }
    if (applied) {
      return (
        <div className="stack">
          <div className="alert alert-success"><Icon name="check" size={18} /> Application submitted. Good luck!</div>
          <Link to="/candidate/applications" className="btn btn-outline btn-block">Track my applications</Link>
        </div>
      )
    }
    return <button className="btn btn-block btn-lg" onClick={() => setApplying(true)}>Apply now</button>
  }

  return (
    <div className={`container page${showBar ? ' has-apply-bar' : ''}`}>
      <BackButton fallback="/jobs" />

      <div className="card job-hero">
        <div className="job-hero-top">
          <span className="avatar avatar-xl">
            {logo ? <img src={logo} alt={`${job.companyName} logo`} /> : initials(job.companyName)}
          </span>
          <div>
            <h1>{job.title}</h1>
            <div className="job-meta">
              <span><Icon name="building" size={15} /> <Link to={`/companies/${job.companyId}`}>{job.companyName}</Link></span>
              <span><Icon name="pin" size={15} /> {job.location}</span>
              <span><Icon name="briefcase" size={15} /> {jobTypeLabel(job.jobType)}</span>
              <span><Icon name="clock" size={15} /> {timeAgo(job.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="row row-between">
          <div>
            <div className="muted small">Pay</div>
            <strong style={{ fontSize: '1.2rem' }}>{formatSalary(job.salaryMin, job.salaryMax)}</strong>
          </div>
          <SaveButton jobId={job.id} withLabel />
        </div>
      </div>

      <div className="details-grid">
        <JobDetails job={job} />

        <aside className="stack">
          <div className="card">
            {showBar ? <div className="desk-only">{renderAction()}<div className="mt" /></div> : renderAction()}
            {!showBar && <div className="mt" />}
            <JobSummary job={job} />
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

      {showBar && (
        <div className="apply-bar">
          <div>
            <div className="small muted">Salary</div>
            <strong>{formatSalary(job.salaryMin, job.salaryMax)}</strong>
          </div>
          {canApply ? (
            <button className="btn" onClick={() => setApplying(true)}>Apply now</button>
          ) : (
            <Link to="/login" state={{ from: location.pathname }} className="btn">Log in to apply</Link>
          )}
        </div>
      )}

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