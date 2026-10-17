import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../common/Icon'
import SaveButton from './SaveButton'
import ApplyModal from '../application/ApplyModal'
import useAuth from '../../hooks/useAuth'
import { ROLES } from '../../utils/constants'
import { formatSalary, jobTypeLabel, skillsToArray, timeAgo } from '../../utils/helpers'

/** Apply / login / status block, shared by the side pane and the full job page. */
export function ApplyAction({ job, applied, onApplied, block = false }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const [applying, setApplying] = useState(false)
  const cls = `btn ij-apply${block ? ' btn-block' : ''}`

  let action
  if (!job.active) {
    action = <div className="alert alert-warning">This job is no longer accepting applications.</div>
  } else if (!isAuthenticated) {
    action = (
      <Link to="/login" state={{ from: location.pathname + location.search }} className={cls}>
        Sign in to apply
      </Link>
    )
  } else if (user.role !== ROLES.CANDIDATE) {
    action = <div className="alert alert-info">Only job seeker accounts can apply for jobs.</div>
  } else if (applied) {
    action = (
      <div className="ij-applied-box">
        <span><Icon name="check" size={18} /> Application submitted</span>
        <Link to="/candidate/applications">Track in My jobs</Link>
      </div>
    )
  } else {
    action = <button type="button" className={cls} onClick={() => setApplying(true)}>Apply now</button>
  }

  return (
    <>
      {action}
      {applying && (
        <ApplyModal
          job={job}
          onClose={() => setApplying(false)}
          onApplied={() => {
            setApplying(false)
            onApplied?.(job.id)
          }}
        />
      )}
    </>
  )
}

/** Right hand job details pane on the search page (desktop only). */
export default function JobPane({ job, applied, onApplied }) {
  const skills = skillsToArray(job.skills)
  const hasSalary = job.salaryMin != null || job.salaryMax != null

  return (
    <aside className="ij-pane" aria-label="Job details">
      <div className="ij-pane-head">
        <h2>{job.title}</h2>
        <Link to={`/companies/${job.companyId}`} className="ij-company">{job.companyName}</Link>
        <div className="ij-loc">{job.location}</div>
        {hasSalary && <div className="ij-pane-pay">{formatSalary(job.salaryMin, job.salaryMax)}</div>}
        <div className="ij-pane-actions">
          <ApplyAction job={job} applied={applied} onApplied={onApplied} />
          <SaveButton jobId={job.id} />
          <Link to={`/jobs/${job.id}`} className="ij-open" aria-label="Open job in full page" title="Open full page">
            <Icon name="external" size={18} />
          </Link>
        </div>
      </div>

      <div className="ij-pane-body">
        <section>
          <h3>Job details</h3>
          <dl className="ij-facts">
            <div><dt>Pay</dt><dd>{formatSalary(job.salaryMin, job.salaryMax)}</dd></div>
            <div><dt>Job type</dt><dd>{jobTypeLabel(job.jobType)}</dd></div>
            <div>
              <dt>Experience</dt>
              <dd>
                {job.experienceRequired == null ? 'Not specified'
                  : job.experienceRequired === 0 ? 'Fresher' : `${job.experienceRequired}+ years`}
              </dd>
            </div>
            <div><dt>Posted</dt><dd>{timeAgo(job.createdAt)}</dd></div>
          </dl>
        </section>

        {skills.length > 0 && (
          <section>
            <h3>Skills</h3>
            <ul className="ij-skills big">{skills.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>
        )}

        <section>
          <h3>Full job description</h3>
          <p className="pre-line break">{job.description}</p>
        </section>
      </div>
    </aside>
  )
}