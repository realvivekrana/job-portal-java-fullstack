import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import JobCard from '../../components/job/JobCard'
import JobFilters from '../../components/job/JobFilters'
import Pagination from '../../components/common/Pagination'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import useApi from '../../hooks/useApi'
import useDebounce from '../../hooks/useDebounce'
import { searchJobs } from '../../api/jobApi'

const PAGE_SIZE = 10
const DEFAULTS = { keyword: '', location: '', jobType: '', minSalary: '', maxExperience: '', sort: 'createdAt:desc' }

export default function JobListing() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => ({
    ...DEFAULTS,
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
  }))
  const [page, setPage] = useState(0)
  const debounced = useDebounce(filters, 400)

  const { data, error, loading, reload } = useApi(() => {
    const [sortBy, sortDir] = debounced.sort.split(':')
    return searchJobs({
      keyword: debounced.keyword.trim(),
      location: debounced.location.trim(),
      jobType: debounced.jobType,
      minSalary: debounced.minSalary,
      maxExperience: debounced.maxExperience,
      page,
      size: PAGE_SIZE,
      sortBy,
      sortDir,
    })
  }, [debounced, page])

  const change = (patch) => {
    setFilters((f) => ({ ...f, ...patch }))
    setPage(0)
  }
  const reset = () => {
    setFilters(DEFAULTS)
    setPage(0)
  }
  const changePage = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Find jobs</h1>
          <p>{data ? `${data.totalElements} job${data.totalElements === 1 ? '' : 's'} found` : 'Searching...'}</p>
        </div>
      </div>

      <div className="listing">
        <JobFilters filters={filters} onChange={change} onReset={reset} />

        <section>
          {error && <ErrorState error={error} onRetry={reload} />}
          {!data && loading && <Loader text="Loading jobs..." />}
          {data && (
            <div style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
              {data.content.length === 0 ? (
                <EmptyState icon="🔎" title="No jobs match your search" text="Try different keywords or clear some filters.">
                  <button className="btn btn-outline" onClick={reset}>Clear filters</button>
                </EmptyState>
              ) : (
                <div className="job-list single">
                  {data.content.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
              <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}