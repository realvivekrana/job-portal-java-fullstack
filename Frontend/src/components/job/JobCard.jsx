import { Link } from 'react-router-dom'
import { formatSalary, initials, jobTypeLabel, skillsToArray, timeAgo } from '../../utils/helpers'

export default function JobCard({ job }) {
  const skills = skillsToArray(job.skills).slice(0, 4)
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
        <span>📍 {job.location}</span>
        <span>💼 {jobTypeLabel(job.jobType)}</span>
        <span>💰 {formatSalary(job.salaryMin, job.salaryMax)}</span>
        {job.experienceRequired !== null && job.experienceRequired !== undefined && (
          <span>🎓 {job.experienceRequired === 0 ? 'Fresher' : `${job.experienceRequired}+ yrs`}</span>
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
        <span className="muted small">{timeAgo(job.createdAt)}</span>
        <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">View details</Link>
      </div>
    </article>
  )
}