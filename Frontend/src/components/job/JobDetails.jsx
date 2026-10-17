import { formatDate, jobTypeLabel, skillsToArray } from '../../utils/helpers'

export default function JobDetails({ job }) {
  const skills = skillsToArray(job.skills)
  return (
    <div className="stack">
      <section className="card">
        <h3 className="card-title">About the role</h3>
        <p className="pre-line break">{job.description}</p>
      </section>

      {skills.length > 0 && (
        <section className="card">
          <h3 className="card-title">Skills required</h3>
          <div className="tags">
            {skills.map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function JobSummary({ job }) {
  return (
    <ul className="info-list">
      <li><span>Location</span><span>{job.location}</span></li>
      <li><span>Job type</span><span>{jobTypeLabel(job.jobType)}</span></li>
      <li>
        <span>Experience</span>
        <span>
          {job.experienceRequired === null || job.experienceRequired === undefined
            ? 'Not specified'
            : job.experienceRequired === 0
              ? 'Fresher'
              : `${job.experienceRequired}+ years`}
        </span>
      </li>
      <li><span>Posted</span><span>{formatDate(job.createdAt)}</span></li>
      <li>
        <span>Status</span>
        <span>
          <span className={`badge ${job.active ? 'badge-active' : 'badge-closed'}`}>
            {job.active ? 'Open' : 'Closed'}
          </span>
        </span>
      </li>
    </ul>
  )
}