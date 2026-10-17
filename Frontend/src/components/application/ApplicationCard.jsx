import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import Icon from '../common/Icon'
import { openResume } from '../../api/applicationApi'
import { STATUS_TRANSITIONS } from '../../utils/constants'
import { formatDate, getErrorMessage, initials, jobTypeLabel } from '../../utils/helpers'
import useToast from '../../hooks/useToast'

/** variant="candidate" shows the job; variant="recruiter" shows the applicant. */
export default function ApplicationCard({ application, variant = 'candidate', onWithdraw, onStatusChange, busy }) {
  const toast = useToast()
  const [showLetter, setShowLetter] = useState(false)
  const [opening, setOpening] = useState(false)
  const a = application
  const c = a.candidate || {}
  const nextStatuses = STATUS_TRANSITIONS[a.status] || []

  const viewResume = async () => {
    setOpening(true)
    try {
      await openResume(a.resumeUrl)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not open the resume'))
    } finally {
      setOpening(false)
    }
  }

  return (
    <article className="card app-card">
      <div className="app-card-head">
        <div className="app-card-id">
          <span className="avatar avatar-lg">{initials(variant === 'candidate' ? a.companyName : c.name)}</span>
          <div style={{ minWidth: 0 }}>
          {variant === 'candidate' ? (
            <>
              <h3 style={{ margin: 0 }}><Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link></h3>
              <span className="muted small">
                {a.companyName} · {a.jobLocation} · {jobTypeLabel(a.jobType)}
              </span>
            </>
          ) : (
            <>
              <h3 style={{ margin: 0 }}>{c.name}</h3>
              <span className="muted small">{c.email}</span>
            </>
          )}
          </div>
        </div>
        <StatusBadge status={a.status} />
      </div>

      {variant === 'recruiter' && (
        <dl className="cand-grid">
          <div><dt>Phone</dt><dd>{c.phone || '-'}</dd></div>
          <div><dt>Location</dt><dd>{c.location || '-'}</dd></div>
          <div><dt>Skills</dt><dd>{c.skills || '-'}</dd></div>
          <div><dt>Education</dt><dd className="pre-line break">{c.education || '-'}</dd></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <dt>Experience</dt><dd className="pre-line break">{c.experience || '-'}</dd>
          </div>
        </dl>
      )}

      <div className="muted small row" style={{ gap: '.4rem' }}><Icon name="clock" size={14} /> Applied on {formatDate(a.appliedAt)}</div>

      {a.coverLetter && (
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowLetter((v) => !v)}>
            {showLetter ? 'Hide cover letter' : 'Show cover letter'}
          </button>
          {showLetter && <p className="pre-line break small" style={{ marginTop: '.5rem' }}>{a.coverLetter}</p>}
        </div>
      )}

      <div className="actions">
        {a.resumeUrl && (
          <button className="btn btn-outline btn-sm" onClick={viewResume} disabled={opening}>
            <Icon name="file" size={15} /> {opening ? 'Opening...' : 'View resume'}
          </button>
        )}

        {variant === 'candidate' && a.status === 'APPLIED' && (
          <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => onWithdraw(a)}>
            <Icon name="trash" size={15} /> Withdraw
          </button>
        )}

        {variant === 'recruiter' &&
          nextStatuses.map((s) => (
            <button
              key={s}
              disabled={busy}
              className={`btn btn-sm ${s === 'REJECTED' ? 'btn-danger' : s === 'INTERVIEWING' ? '' : 'btn-success'}`}
              onClick={() => onStatusChange(a, s)}
            >
              {s === 'SHORTLISTED' ? 'Shortlist' : s === 'INTERVIEWING' ? 'Interview' : s === 'HIRED' ? 'Hire' : 'Reject'}
            </button>
          ))}
      </div>
    </article>
  )
}