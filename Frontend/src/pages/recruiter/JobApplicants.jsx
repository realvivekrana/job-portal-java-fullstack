import { useState } from 'react'
import { useParams } from 'react-router-dom'
import BackButton from '../../components/common/BackButton'
import ApplicationCard from '../../components/application/ApplicationCard'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import { getJob } from '../../api/jobApi'
import { getJobApplicants, updateApplicationStatus } from '../../api/applicationApi'
import { APPLICATION_STATUSES } from '../../utils/constants'
import { getErrorMessage } from '../../utils/helpers'

export default function JobApplicants() {
  const { jobId } = useParams()
  const toast = useToast()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [pending, setPending] = useState(null) // { application, status }
  const [busy, setBusy] = useState(false)

  const job = useApi(() => getJob(jobId), [jobId])
  const { data, error, loading, reload } = useApi(
    () => getJobApplicants(jobId, { status: status || undefined, page, size: 8 }),
    [jobId, status, page],
  )

  const apply = async (application, next) => {
    setBusy(true)
    try {
      await updateApplicationStatus(application.id, next)
      toast.success(`Status changed to ${next.charAt(0) + next.slice(1).toLowerCase()}`)
      setPending(null)
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  // Rejecting and hiring are final, so ask first. Shortlisting and interviews go straight through.
  const onStatusChange = (application, next) => {
    if (next === 'SHORTLISTED' || next === 'INTERVIEWING') apply(application, next)
    else setPending({ application, status: next })
  }

  const changeFilter = (value) => {
    setStatus(value)
    setPage(0)
  }

  return (
    <div className="dash-page">
      <BackButton fallback="/recruiter/jobs" />
      <div className="page-header">
        <div>
          <h1>Applicants</h1>
          <p>{job.data ? job.data.title : 'Loading job...'}{data ? ` · ${data.totalElements} found` : ''}</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`chip${status === '' ? ' active' : ''}`} onClick={() => changeFilter('')}>All</button>
        {APPLICATION_STATUSES.map((s) => (
          <button key={s.value} className={`chip${status === s.value ? ' active' : ''}`} onClick={() => changeFilter(s.value)}>
            {s.label}
          </button>
        ))}
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loader />}
      {data && data.content.length === 0 && (
        <EmptyState icon="users" title="No applicants here yet" text={status ? 'No applications with this status.' : 'Applications will appear here as candidates apply.'} />
      )}
      {data && data.content.length > 0 && (
        <div className="stack" style={{ opacity: loading ? 0.6 : 1 }}>
          {data.content.map((a) => (
            <ApplicationCard key={a.id} application={a} variant="recruiter" busy={busy} onStatusChange={onStatusChange} />
          ))}
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}

      {pending && (
        <ConfirmModal
          title={pending.status === 'HIRED' ? 'Hire this candidate?' : 'Reject this application?'}
          message={
            pending.status === 'HIRED'
              ? `${pending.application.candidate?.name} will be marked as hired and notified by email. This cannot be undone.`
              : `${pending.application.candidate?.name}'s application will be rejected and they will be notified by email. This cannot be undone.`
          }
          confirmLabel={pending.status === 'HIRED' ? 'Yes, hire' : 'Yes, reject'}
          danger={pending.status === 'REJECTED'}
          busy={busy}
          onConfirm={() => apply(pending.application, pending.status)}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}