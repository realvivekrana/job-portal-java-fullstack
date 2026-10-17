import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import SaveButton from './SaveButton'
import { formatSalary, jobTypeLabel, skillsToArray, timeAgo } from '../../utils/helpers'

const isNew = (value) => value && Date.now() - new Date(value).getTime() < 3 * 24 * 3600 * 1000
const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

/**
 * Search result card. On wide screens clicking it calls `onSelect` so the job opens in the
 * side pane (like Indeed); on phones it goes to the full job page.
 */
export default function JobCard({ job, selected = false, onSelect, applied = false }) {
  const skills = skillsToArray(job.skills).slice(0, 3)
  const hasSalary = job.salaryMin != null || job.salaryMax != null

  const open = (e) => {
    if (onSelect && isDesktop()) {
      e.preventDefault()
      onSelect(job)
    }
  }

  return (
    <article className={`ij-card${selected ? ' selected' : ''}`}>
      <div className="ij-card-top">
        <div className="ij-card-main">
          {isNew(job.createdAt) && <span className="ij-new">New</span>}
          <h3>
            <Link to={`/jobs/${job.id}`} onClick={open}>{job.title}</Link>
          </h3>
          <Link to={`/companies/${job.companyId}`} className="ij-company">{job.companyName}</Link>
          <div className="ij-loc">{job.location}</div>
        </div>
        <SaveButton jobId={job.id} />
      </div>

      <div className="ij-chips">
        {hasSalary && <span className="ij-chip pay">{formatSalary(job.salaryMin, job.salaryMax)}</span>}
        <span className="ij-chip">{jobTypeLabel(job.jobType)}</span>
        {job.experienceRequired === 0 && <span className="ij-chip">Fresher</span>}
        {job.experienceRequired > 0 && <span className="ij-chip">{job.experienceRequired}+ yrs</span>}
      </div>

      <p className="ij-snippet">{job.description}</p>

      {skills.length > 0 && (
        <ul className="ij-skills">
          {skills.map((s) => <li key={s}>{s}</li>)}
        </ul>
      )}

      <div className="ij-card-foot">
        {applied ? (
          <span className="ij-applied"><Icon name="check" size={14} /> Applied</span>
        ) : (
          <span className="ij-easy"><Icon name="zap" size={14} /> Easily apply</span>
        )}
        <span>{timeAgo(job.createdAt)}</span>
      </div>
    </article>
  )
}