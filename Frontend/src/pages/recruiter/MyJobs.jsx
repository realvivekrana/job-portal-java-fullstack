import { useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../../components/common/Pagination'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import ConfirmModal from '../../components/common/ConfirmModal'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import { getMyJobs, setJobActive } from '../../api/jobApi'
import { formatDate, formatSalary, getErrorMessage, jobTypeLabel } from '../../utils/helpers'

export default function MyJobs() {
  const toast = useToast()
  const [page, setPage] = useState(0)
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const { data, error, loading, reload } = useApi(() => getMyJobs({ page, size: 10 }), [page])

  const toggle = async () => {
    setBusy(true)
    try {
      await setJobActive(target.id, !target.active)
      toast.success(target.active ? 'Job closed' : 'Job reopened')
      setTarget(null)
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>My jobs</h1>
          <p>{data ? `${data.totalElements} job${data.totalElements === 1 ? '' : 's'} posted` : 'Jobs you have posted.'}</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn">+ Post a job</Link>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loader />}
      {data && data.content.length === 0 && (
        <EmptyState icon="💼" title="You have not posted any jobs" text="Post a job to start receiving applications.">
          <Link to="/recruiter/jobs/new" className="btn">Post a job</Link>
        </EmptyState>
      )}
      {data && data.content.length > 0 && (
        <div style={{ opacity: loading ? 0.6 : 1 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Location</th><th>Type</th><th>Salary</th><th>Posted</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.content.map((j) => (
                  <tr key={j.id}>
                    <td className="wrap"><Link to={`/jobs/${j.id}`}>{j.title}</Link></td>
                    <td>{j.location}</td>
                    <td>{jobTypeLabel(j.jobType)}</td>
                    <td>{formatSalary(j.salaryMin, j.salaryMax)}</td>
                    <td>{formatDate(j.createdAt)}</td>
                    <td><span className={`badge ${j.active ? 'badge-active' : 'badge-closed'}`}>{j.active ? 'Open' : 'Closed'}</span></td>
                    <td>
                      <div className="actions">
                        <Link to={`/recruiter/jobs/${j.id}/applicants`} className="btn btn-outline btn-sm">Applicants</Link>
                        <Link to={`/recruiter/jobs/${j.id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                        <button className={`btn btn-sm ${j.active ? 'btn-danger' : 'btn-success'}`} onClick={() => setTarget(j)}>
                          {j.active ? 'Close' : 'Reopen'}
                        </button>
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
          title={target.active ? 'Close this job?' : 'Reopen this job?'}
          message={
            target.active
              ? `"${target.title}" will no longer accept applications.`
              : `"${target.title}" will be visible and open for applications again.`
          }
          confirmLabel={target.active ? 'Close job' : 'Reopen job'}
          danger={target.active}
          busy={busy}
          onConfirm={toggle}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  )
}