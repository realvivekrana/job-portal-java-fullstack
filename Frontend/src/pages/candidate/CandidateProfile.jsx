import { useState } from 'react'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import { getMyProfile, removeResume, updateProfile, uploadResume } from '../../api/profileApi'
import { openResume } from '../../api/applicationApi'
import { MAX_FILE_SIZE, RESUME_EXTENSIONS } from '../../utils/constants'
import { getErrorMessage, getFieldErrors, validateFile } from '../../utils/helpers'

function ProfileForm({ initial, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState({
    phone: initial.phone || '',
    location: initial.location || '',
    skills: initial.skills || '',
    experience: initial.experience || '',
    education: initial.education || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (f) => (e) => {
    setValues((v) => ({ ...v, [f]: e.target.value }))
    setErrors((er) => ({ ...er, [f]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (values.phone && !/^[0-9+()\-\s]{7,20}$/.test(values.phone)) {
      return setErrors({ phone: 'Enter a valid phone number (7 to 20 digits)' })
    }
    setSaving(true)
    try {
      const saved = await updateProfile(values)
      toast.success('Profile saved')
      onSaved(saved)
    } catch (err) {
      setErrors(getFieldErrors(err))
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const cls = (f) => `input${errors[f] ? ' invalid' : ''}`

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h3>Personal details</h3>
      <div className="form-grid cols-2">
        <div className="field">
          <label htmlFor="p-phone">Phone</label>
          <input id="p-phone" className={cls('phone')} value={values.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
        <div className="field">
          <label htmlFor="p-loc">Location</label>
          <input id="p-loc" className={cls('location')} value={values.location} onChange={set('location')} placeholder="Pune, Maharashtra" />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="p-skills">Skills</label>
        <input id="p-skills" className={cls('skills')} value={values.skills} onChange={set('skills')} placeholder="Java, Spring Boot, React" />
        <span className="hint">Separate skills with commas</span>
        {errors.skills && <span className="error-text">{errors.skills}</span>}
      </div>
      <div className="field">
        <label htmlFor="p-exp">Experience</label>
        <textarea id="p-exp" className={cls('experience')} rows={5} value={values.experience} onChange={set('experience')}
          placeholder="Companies, roles and what you worked on" />
        {errors.experience && <span className="error-text">{errors.experience}</span>}
      </div>
      <div className="field">
        <label htmlFor="p-edu">Education</label>
        <textarea id="p-edu" className={cls('education')} rows={4} value={values.education} onChange={set('education')}
          placeholder="Degree, college and year" />
        {errors.education && <span className="error-text">{errors.education}</span>}
      </div>
      <div><button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button></div>
    </form>
  )
}

function ResumeCard({ profile, onChange }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const onFile = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    const problem = validateFile(file, RESUME_EXTENSIONS, MAX_FILE_SIZE)
    if (problem) return toast.error(problem)
    setBusy(true)
    try {
      onChange(await uploadResume(file))
      toast.success('Resume uploaded')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      onChange(await removeResume())
      toast.success('Resume removed')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const view = async () => {
    try {
      await openResume(profile.resumeUrl)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not open the resume'))
    }
  }

  return (
    <div className="card">
      <h3>Resume</h3>
      <p className="muted small">PDF, DOC or DOCX, up to 5 MB. Used automatically when you apply for jobs.</p>
      {profile.resumeUrl ? (
        <div className="file-row">
          <span>📄 Resume uploaded</span>
          <div className="actions">
            <button className="btn btn-outline btn-sm" onClick={view}>View</button>
            <button className="btn btn-danger btn-sm" onClick={remove} disabled={busy}>Remove</button>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">You have not uploaded a resume yet.</div>
      )}
      <div className="field mt">
        <label htmlFor="p-resume">{profile.resumeUrl ? 'Replace resume' : 'Upload resume'}</label>
        <input id="p-resume" type="file" className="input" accept=".pdf,.doc,.docx" onChange={onFile} disabled={busy} />
        {busy && <span className="hint">Please wait...</span>}
      </div>
    </div>
  )
}

export default function CandidateProfile() {
  const { data, error, loading, reload } = useApi(() => getMyProfile(), [])
  const [override, setOverride] = useState(null)
  const profile = override || data

  if (loading && !profile) return <Loader page />
  if (error && !profile) return <div className="container page"><ErrorState error={error} onRetry={reload} /></div>

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>My profile</h1>
          <p>{profile.name} · {profile.email}</p>
        </div>
      </div>
      <div className="stack">
        <ResumeCard profile={profile} onChange={setOverride} />
        <ProfileForm initial={profile} onSaved={setOverride} />
      </div>
    </div>
  )
}