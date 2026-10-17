import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../common/Modal'
import Loader from '../common/Loader'
import { applyToJob } from '../../api/applicationApi'
import { getMyProfile } from '../../api/profileApi'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import { MAX_FILE_SIZE, RESUME_EXTENSIONS } from '../../utils/constants'
import { getErrorMessage, validateFile } from '../../utils/helpers'

export default function ApplyModal({ job, onClose, onApplied }) {
  const toast = useToast()
  const { data: profile, loading } = useApi(() => getMyProfile(), [])
  const [coverLetter, setCoverLetter] = useState('')
  const [resume, setResume] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const profileResume = Boolean(profile?.resumeUrl)

  const onFile = (e) => {
    const file = e.target.files[0]
    if (!file) return setResume(null)
    const problem = validateFile(file, RESUME_EXTENSIONS, MAX_FILE_SIZE)
    if (problem) {
      setError(problem)
      e.target.value = ''
      return setResume(null)
    }
    setError('')
    setResume(file)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!resume && !profileResume) {
      return setError('Please upload a resume, or add one to your profile first.')
    }
    setSubmitting(true)
    setError('')
    try {
      await applyToJob(job.id, { coverLetter: coverLetter.trim(), resume })
      toast.success('Application submitted successfully!')
      onApplied()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`Apply: ${job.title}`} onClose={onClose}>
      {loading ? (
        <Loader />
      ) : (
        <form className="form" onSubmit={submit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label htmlFor="a-resume">Resume (PDF, DOC or DOCX, max 5 MB)</label>
            <input id="a-resume" type="file" className="input" accept=".pdf,.doc,.docx" onChange={onFile} />
            <span className="hint">
              {profileResume
                ? 'Leave empty to use the resume saved in your profile.'
                : <>No resume in your profile yet. Upload one here or <Link to="/candidate/profile">add it to your profile</Link>.</>}
            </span>
          </div>

          <div className="field">
            <label htmlFor="a-letter">Cover letter (optional)</label>
            <textarea id="a-letter" className="input" rows={6} maxLength={5000} value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the recruiter why you are a good fit..." />
            <span className="hint">{coverLetter.length}/5000</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit application'}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}