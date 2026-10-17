import { useState } from 'react'
import { Link } from 'react-router-dom'
import JobCard from '../../components/job/JobCard'
import Pagination from '../../components/common/Pagination'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import useApi from '../../hooks/useApi'
import useSavedJobs from '../../hooks/useSavedJobs'
import { getSavedJobs } from '../../api/savedApi'

export default function SavedJobs() {
  const [page, setPage] = useState(0)
  const { ids } = useSavedJobs()
  // reload when a job is unsaved from this very page
  const { data, error, loading, reload } = useApi(() => getSavedJobs({ page, size: 10 }), [page, ids.length])

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1>Saved jobs</h1>
          <p>{data ? `${data.totalElements} saved` : 'Jobs you bookmarked to look at later.'}</p>
        </div>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loader text="Loading saved jobs..." />}
      {data && data.content.length === 0 && (
        <EmptyState icon="bookmark" title="No saved jobs yet" text="Tap the bookmark on any job to keep it here.">
          <Link to="/jobs" className="btn">Find jobs</Link>
        </EmptyState>
      )}
      {data && data.content.length > 0 && (
        <>
          <div className="ij-cards">
            {data.content.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}