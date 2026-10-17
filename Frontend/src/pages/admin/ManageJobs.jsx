import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import Pagination from '../../components/common/Pagination'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import ConfirmModal from '../../components/common/ConfirmModal'
import useApi from '../../hooks/useApi'
import useDebounce from '../../hooks/useDebounce'
import useToast from '../../hooks/useToast'
import { deleteAdminJob, getAdminJobs, setAdminJobActive } from '../../api/authApi'
import { formatDate, getErrorMessage, jobTypeLabel } from '../../utils/helpers'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Open' },
  { value: 'false', label: 'Closed' },
]

export default function ManageJobs() {
  const toast = useToast()
  const [keyword, setKeyword] = useState('')
  const [active, setActive] = useState('')
  const [page, setPage] = useState(0)
  const [target, setTarget] = useState(null) // { job, action: 'toggle' | 'delete' }
  const [busy, setBusy] = useState(false)
  const debounced = useDebounce(keyword, 400)

  const { data, error, loading, reload } = useApi(
    () => getAdminJobs({ keyword: debounced.trim() || undefined, active: active === '' ? undefined : active === 'true', page, size: 10 }),
    [debounced, active, page],
  )

  const confirm = async () => {
    setBusy(true)
    try {
      if (target.action === 'delete') {
        await deleteAdminJob(target.job.id)
        toast.success('Job deleted')
        if (data.content.length === 1 && page > 0) setPage(page - 1)
        else reload()
      } else {
        await setAdminJobActive(target.job.id, !target.job.active)
        toast.success(target.job.active ? 'Job closed' : 'Job reopened')
        reload()
      }
      setTarget(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const isDelete = target?.action === 'delete'

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1>Jobs</h1>
          <p>{data ? `${data.totalElements} job${data.totalElements === 1 ? '' : 's'}` : 'Moderate jobs posted on the platform.'}</p>
        </div>
      </div>

      <div className="toolbar">
        <span className="input-icon" style={{ maxWidth: 360, width: '100%' }}>
          <Icon name="search" size={18} />
          <input className="input" placeholder="Search by title or company" value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0) }} aria-label="Search jobs" />
        </span>
      </div>
      <div className="tabs">
        {STATUS_FILTERS.map((f) => (
          <button key={f.value} className={`chip${active === f.value ? ' active' : ''}`}
            onClick={() => { setActive(f.value); setPage(0) }}>{f.label}</button>
        ))}
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loader />}
      {data && data.content.length === 0 && <EmptyState icon="briefcase" title="No jobs found" />}
      {data && data.content.length > 0 && (
        <div style={{ opacity: loading ? 0.6 : 1 }}>
          <div className="table-wrap">
            <table className="responsive">
              <thead>
                <tr><th>Title</th><th>Company</th><th>Location</th><th>Type</th><th>Posted</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.content.map((j) => (
                  <tr key={j.id}>
                    <td className="wrap" data-label="Title"><Link to={`/jobs/${j.id}`}>{j.title}</Link></td>
                    <td data-label="Company">{j.companyName}</td>
                    <td data-label="Location">{j.location}</td>
                    <td data-label="Type">{jobTypeLabel(j.jobType)}</td>
                    <td data-label="Posted">{formatDate(j.createdAt)}</td>
                    <td data-label="Status"><span className={`badge ${j.active ? 'badge-active' : 'badge-closed'}`}>{j.active ? 'Open' : 'Closed'}</span></td>
                    <td data-label="Actions">
                      <div className="actions">
                        <button className="btn btn-outline btn-sm" onClick={() => setTarget({ job: j, action: 'toggle' })}>
                          {j.active ? 'Close' : 'Reopen'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setTarget({ job: j, action: 'delete' })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}

      {target && (
        <ConfirmModal
          title={isDelete ? 'Delete this job?' : target.job.active ? 'Close this job?' : 'Reopen this job?'}
          message={
            isDelete
              ? `"${target.job.title}" and its applications will be permanently deleted. This cannot be undone.`
              : target.job.active
                ? `"${target.job.title}" will stop accepting applications.`
                : `"${target.job.title}" will be open for applications again.`
          }
          confirmLabel={isDelete ? 'Delete' : target.job.active ? 'Close job' : 'Reopen job'}
          danger={isDelete || target.job.active}
          busy={busy}
          onConfirm={confirm}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  )
}