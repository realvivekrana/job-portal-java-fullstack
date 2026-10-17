import { useState } from 'react'
import { Link } from 'react-router-dom'
import ApplicationCard from '../../components/application/ApplicationCard'
import ConfirmModal from '../../components/common/ConfirmModal'
import Pagination from '../../components/common/Pagination'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import { getMyApplications, withdrawApplication } from '../../api/applicationApi'
import { getErrorMessage } from '../../utils/helpers'

export default function MyApplications() {
  const toast = useToast()
  const [page, setPage] = useState(0)
  const [toWithdraw, setToWithdraw] = useState(null)
  const [busy, setBusy] = useState(false)
  const { data, error, loading, reload } = useApi(() => getMyApplications({ page, size: 8 }), [page])

  const confirmWithdraw = async () => {
    setBusy(true)
    try {
      await withdrawApplication(toWithdraw.id)
      toast.success('Application withdrawn')
      setToWithdraw(null)
      // If this was the last item on the page, go back one page
      if (data.content.length === 1 && page > 0) setPage(page - 1)
      else reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1>My applications</h1>
          <p>{data ? `${data.totalElements} total` : 'Track the status of every job you applied to.'}</p>
        </div>
        <Link to="/jobs" className="btn btn-outline">Find more jobs</Link>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loader />}
      {data && data.content.length === 0 && (
        <EmptyState icon="send" title="You have not applied to any job yet" text="Your applications will show up here.">
          <Link to="/jobs" className="btn">Browse jobs</Link>
        </EmptyState>
      )}
      {data && data.content.length > 0 && (
        <div className="stack" style={{ opacity: loading ? 0.6 : 1 }}>
          {data.content.map((a) => (
            <ApplicationCard key={a.id} application={a} variant="candidate" onWithdraw={setToWithdraw} busy={busy} />
          ))}
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}

      {toWithdraw && (
        <ConfirmModal
          title="Withdraw application?"
          message={`Your application for "${toWithdraw.jobTitle}" will be withdrawn. You can apply again later.`}
          confirmLabel="Withdraw"
          danger
          busy={busy}
          onConfirm={confirmWithdraw}
          onCancel={() => setToWithdraw(null)}
        />
      )}
    </div>
  )
}