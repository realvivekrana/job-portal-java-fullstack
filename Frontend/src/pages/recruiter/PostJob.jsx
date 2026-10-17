import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BackButton from '../../components/common/BackButton'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import JobForm from '../../components/job/JobForm'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import { createJob, getJob, updateJob } from '../../api/jobApi'
import { getMyCompany } from '../../api/companyApi'
import { getErrorMessage, getFieldErrors } from '../../utils/helpers'

export default function PostJob() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [serverErrors, setServerErrors] = useState({})

  const company = useApi(() => getMyCompany().catch((e) => (e.response?.status === 404 ? null : Promise.reject(e))), [])
  const job = useApi(() => (isEdit ? getJob(id) : Promise.resolve(null)), [id])

  if ((company.loading && !company.data) || (job.loading && !job.data)) return <Loader page />
  if (company.error) return <div className="container page"><ErrorState error={company.error} onRetry={company.reload} /></div>
  if (job.error) return <div className="container page"><ErrorState error={job.error} onRetry={job.reload} /></div>

  if (!company.data) {
    return (
      <div className="container page">
        <div className="empty">
          <div className="empty-icon">🏢</div>
          <h3>Create your company first</h3>
          <p>You need a company profile before you can post jobs.</p>
          <Link to="/recruiter/company" className="btn">Create company</Link>
        </div>
      </div>
    )
  }

  const submit = async (payload) => {
    setSaving(true)
    setServerErrors({})
    try {
      if (isEdit) {
        await updateJob(id, payload)
        toast.success('Job updated')
      } else {
        await createJob(payload)
        toast.success('Job posted successfully')
      }
      navigate('/recruiter/jobs')
    } catch (err) {
      setServerErrors(getFieldErrors(err))
      toast.error(getErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <div className="container page">
      <BackButton fallback="/recruiter/jobs" />
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Edit job' : 'Post a new job'}</h1>
          <p>Posting as {company.data.name}</p>
        </div>
      </div>
      <div className="card">
        <JobForm
          key={job.data?.id || 'new'}
          job={job.data}
          onSubmit={submit}
          submitting={saving}
          serverErrors={serverErrors}
          submitLabel={isEdit ? 'Save changes' : 'Post job'}
        />
      </div>
    </div>
  )
}