import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import JobCard from '../../components/job/JobCard'
import JobFilters from '../../components/job/JobFilters'
import JobPane from '../../components/job/JobPane'
import SearchBar from '../../components/job/SearchBar'
import Pagination from '../../components/common/Pagination'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import Icon from '../../components/common/Icon'
import EmptyState from '../../components/common/EmptyState'
import useApi from '../../hooks/useApi'
import useSite from '../../hooks/useSite'
import { searchJobs } from '../../api/jobApi'
import { SORT_OPTIONS } from '../../utils/constants'

const PAGE_SIZE = 10
const FILTER_KEYS = ['jobType', 'minSalary', 'maxExperience', 'postedWithinDays']

/** All search state lives in the URL, so results can be shared, bookmarked and reached with the Back button. */
export default function JobListing() {
  const [params, setParams] = useSearchParams()
  const { overview, refreshOverview } = useSite()
  const [selectedId, setSelectedId] = useState(null)
  const [appliedIds, setAppliedIds] = useState([])

  const q = useMemo(
    () => ({
      keyword: params.get('keyword') || '',
      location: params.get('location') || '',
      jobType: params.get('jobType') || '',
      minSalary: params.get('minSalary') || '',
      maxExperience: params.get('maxExperience') || '',
      postedWithinDays: params.get('postedWithinDays') || '',
      sort: params.get('sort') || 'createdAt:desc',
      page: Number(params.get('page')) || 0,
    }),
    [params],
  )

  useEffect(() => {
    if (!overview) refreshOverview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data, error, loading, reload } = useApi(() => {
    const [sortBy, sortDir] = q.sort.split(':')
    return searchJobs({
      keyword: q.keyword,
      location: q.location,
      jobType: q.jobType,
      minSalary: q.minSalary,
      maxExperience: q.maxExperience,
      postedWithinDays: q.postedWithinDays,
      page: q.page,
      size: PAGE_SIZE,
      sortBy,
      sortDir,
    })
  }, [q])

  const update = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries({ ...patch, page: patch.page ?? '' }).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || v === 0 || (k === 'sort' && v === 'createdAt:desc')) next.delete(k)
      else next.set(k, String(v))
    })
    setParams(next)
    setSelectedId(null)
  }

  const reset = () => {
    const next = new URLSearchParams()
    if (q.keyword) next.set('keyword', q.keyword)
    if (q.location) next.set('location', q.location)
    setParams(next)
    setSelectedId(null)
  }

  const jobs = data?.content || []
  const selected = jobs.find((j) => j.id === selectedId) || jobs[0] || null
  const filtersOn = FILTER_KEYS.some((k) => q[k])
  const title = q.keyword || q.location ? [q.keyword, q.location && `in ${q.location}`].filter(Boolean).join(' ') : 'All jobs'

  const changePage = (p) => {
    update({ ...q, page: p })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="ij-results">
      <div className="ij-results-top">
        <div className="container">
          <SearchBar
            key={`${q.keyword}|${q.location}`}
            keyword={q.keyword}
            location={q.location}
            suggestions={{ skills: overview?.popularSkills, locations: overview?.popularLocations }}
            onSearch={(s) => update({ ...q, ...s, page: 0 })}
          />
          <JobFilters filters={q} onChange={(patch) => update({ ...q, ...patch, page: 0 })} onReset={reset} />
        </div>
      </div>

      <div className="container ij-results-body">
        <section className="ij-list-col" aria-label="Search results">
          <div className="ij-list-head">
            <div>
              <h1>{title}</h1>
              <p>{data ? `${data.totalElements} job${data.totalElements === 1 ? '' : 's'}` : 'Searching...'}</p>
            </div>
            <label className="ij-sort">
              <span>Sort by</span>
              <select value={q.sort} onChange={(e) => update({ ...q, sort: e.target.value, page: 0 })}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>

          {error && <ErrorState error={error} onRetry={reload} />}
          {!data && loading && <Loader text="Loading jobs..." />}
          {data && (
            <div style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
              {jobs.length === 0 ? (
                <EmptyState icon="search" title="No jobs match your search" text="Check your spelling or try more general keywords.">
                  {(filtersOn || q.keyword || q.location) && (
                    <button className="btn btn-outline" onClick={() => setParams(new URLSearchParams())}>
                      <Icon name="x" size={16} /> Clear search
                    </button>
                  )}
                </EmptyState>
              ) : (
                <div className="ij-cards">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      selected={selected?.id === job.id}
                      applied={appliedIds.includes(job.id)}
                      onSelect={(j) => setSelectedId(j.id)}
                    />
                  ))}
                </div>
              )}
              <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} />
            </div>
          )}
        </section>

        {selected && (
          <JobPane
            key={selected.id}
            job={selected}
            applied={appliedIds.includes(selected.id)}
            onApplied={(id) => setAppliedIds((l) => [...l, id])}
          />
        )}
      </div>
    </div>
  )
}