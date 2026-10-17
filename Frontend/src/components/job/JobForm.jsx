import { useState } from 'react'
import { JOB_TYPES } from '../../utils/constants'

const EMPTY = {
  title: '',
  description: '',
  location: '',
  jobType: 'FULL_TIME',
  salaryMin: '',
  salaryMax: '',
  experienceRequired: '',
  skills: '',
}

function fromJob(job) {
  if (!job) return EMPTY
  return {
    title: job.title || '',
    description: job.description || '',
    location: job.location || '',
    jobType: job.jobType || 'FULL_TIME',
    salaryMin: job.salaryMin ?? '',
    salaryMax: job.salaryMax ?? '',
    experienceRequired: job.experienceRequired ?? '',
    skills: job.skills || '',
  }
}

export default function JobForm({ job, onSubmit, submitting, serverErrors = {}, submitLabel = 'Post job' }) {
  const [values, setValues] = useState(() => fromJob(job))
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const validate = () => {
    const er = {}
    if (!values.title.trim()) er.title = 'Title is required'
    if (!values.description.trim()) er.description = 'Description is required'
    if (!values.location.trim()) er.location = 'Location is required'
    const min = values.salaryMin === '' ? null : Number(values.salaryMin)
    const max = values.salaryMax === '' ? null : Number(values.salaryMax)
    if (min !== null && min < 0) er.salaryMin = 'Cannot be negative'
    if (max !== null && max < 0) er.salaryMax = 'Cannot be negative'
    if (min !== null && max !== null && max < min) er.salaryMax = 'Maximum must be greater than minimum'
    if (values.experienceRequired !== '') {
      const exp = Number(values.experienceRequired)
      if (exp < 0 || exp > 50) er.experienceRequired = 'Enter 0 to 50 years'
    }
    return er
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const er = validate()
    setErrors(er)
    if (Object.keys(er).length) return
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      jobType: values.jobType,
      salaryMin: values.salaryMin === '' ? null : Number(values.salaryMin),
      salaryMax: values.salaryMax === '' ? null : Number(values.salaryMax),
      experienceRequired: values.experienceRequired === '' ? null : Number(values.experienceRequired),
      skills: values.skills.trim() || null,
    })
  }

  const err = (f) => errors[f] || serverErrors[f]
  const cls = (f) => `input${err(f) ? ' invalid' : ''}`

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="j-title">Job title *</label>
        <input id="j-title" className={cls('title')} maxLength={150} value={values.title} onChange={set('title')}
          placeholder="e.g. Java Backend Developer" />
        {err('title') && <span className="error-text">{err('title')}</span>}
      </div>

      <div className="form-grid cols-2">
        <div className="field">
          <label htmlFor="j-location">Location *</label>
          <input id="j-location" className={cls('location')} maxLength={100} value={values.location}
            onChange={set('location')} placeholder="e.g. Pune, Maharashtra" />
          {err('location') && <span className="error-text">{err('location')}</span>}
        </div>
        <div className="field">
          <label htmlFor="j-type">Job type *</label>
          <select id="j-type" className={cls('jobType')} value={values.jobType} onChange={set('jobType')}>
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {err('jobType') && <span className="error-text">{err('jobType')}</span>}
        </div>
      </div>

      <div className="form-grid cols-2">
        <div className="field">
          <label htmlFor="j-min">Minimum salary (₹ per year)</label>
          <input id="j-min" type="number" min="0" className={cls('salaryMin')} value={values.salaryMin}
            onChange={set('salaryMin')} placeholder="300000" />
          {err('salaryMin') && <span className="error-text">{err('salaryMin')}</span>}
        </div>
        <div className="field">
          <label htmlFor="j-max">Maximum salary (₹ per year)</label>
          <input id="j-max" type="number" min="0" className={cls('salaryMax')} value={values.salaryMax}
            onChange={set('salaryMax')} placeholder="600000" />
          {err('salaryMax') && <span className="error-text">{err('salaryMax')}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="j-exp">Experience required (years)</label>
        <input id="j-exp" type="number" min="0" max="50" className={cls('experienceRequired')}
          value={values.experienceRequired} onChange={set('experienceRequired')} placeholder="0 for freshers" />
        {err('experienceRequired') && <span className="error-text">{err('experienceRequired')}</span>}
      </div>

      <div className="field">
        <label htmlFor="j-skills">Skills</label>
        <input id="j-skills" className={cls('skills')} maxLength={500} value={values.skills} onChange={set('skills')}
          placeholder="Java, Spring Boot, MySQL" />
        <span className="hint">Separate skills with commas</span>
        {err('skills') && <span className="error-text">{err('skills')}</span>}
      </div>

      <div className="field">
        <label htmlFor="j-desc">Job description *</label>
        <textarea id="j-desc" className={cls('description')} rows={9} maxLength={10000} value={values.description}
          onChange={set('description')} placeholder="Responsibilities, requirements, benefits..." />
        {err('description') && <span className="error-text">{err('description')}</span>}
      </div>

      <div className="row">
        <button className="btn" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</button>
      </div>
    </form>
  )
}