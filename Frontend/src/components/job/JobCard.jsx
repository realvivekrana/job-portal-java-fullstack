import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import { formatSalary, initials, jobTypeLabel, skillsToArray, timeAgo } from '../../utils/helpers'

const isNew = (value) => value && Date.now() - new Date(value).getTime() < 3 * 24 * 3600 * 1000

export default function JobCard({ job }) {
  const skills = skillsToArray(job.skills).slice(0, 4)
  const hasExp = job.experienceRequired !== null && job.experienceRequired !== undefined
  return (
    <article className="card job-card">
      <div className="job-card-head">
        <span className="avatar avatar-lg">{initials(job.companyName)}</span>
        <div>
          <h3>
            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
          <span className="muted small">{job.companyName}</span>
        </div>
      </div>

      <div className="job-meta">
        <span><Icon name="pin" size={15} /> {job.location}</span>
        <span><Icon name="briefcase" size={15} /> {jobTypeLabel(job.jobType)}</span>
        <span><Icon name="rupee" size={15} /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
        {hasExp && (
          <span><Icon name="cap" size={15} /> {job.experienceRequired === 0 ? 'Fresher' : `${job.experienceRequired}+ yrs`}</span>
        )}
      </div>

      <p className="job-desc">{job.description}</p>

      {skills.length > 0 && (
        <div className="tags">
          {skills.map((s) => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>
      )}

      <div className="job-card-foot">
        <span className="muted small row" style={{ gap: '.5rem' }}>
          {isNew(job.createdAt) && <span className="badge badge-new">New</span>}
          {timeAgo(job.createdAt)}
        </span>
        <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">View details</Link>
      </div>
    </article>
  )
}