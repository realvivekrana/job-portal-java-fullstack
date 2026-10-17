import { Link, useParams } from 'react-router-dom'
import BackButton from '../../components/common/BackButton'
import JobCard from '../../components/job/JobCard'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import Icon from '../../components/common/Icon'
import useApi from '../../hooks/useApi'
import { getCompany } from '../../api/companyApi'
import { searchJobs } from '../../api/jobApi'
import { fileUrl, initials, plural } from '../../utils/helpers'

export default function CompanyPage() {
  const { id } = useParams()
  const company = useApi(() => getCompany(id), [id])
  const name = company.data?.name
  const jobs = useApi(
    () => (name ? searchJobs({ keyword: name, size: 50 }) : Promise.resolve(null)),
    [name],
  )

  if (company.loading && !company.data) return <Loader page text="Loading company..." />
  if (company.error) {
    const notFound = company.error.response?.status === 404
    return (
      <div className="container page">
        <BackButton fallback="/jobs" />
        {notFound ? (
          <EmptyState icon="building" title="Company not found" text="This company page does not exist.">
            <Link to="/jobs" className="btn">Browse jobs</Link>
          </EmptyState>
        ) : (
          <ErrorState error={company.error} onRetry={company.reload} />
        )}
      </div>
    )
  }

  const c = company.data
  const openJobs = (jobs.data?.content || []).filter((j) => j.companyId === c.id)
  const site = c.website && (/^https?:\/\//i.test(c.website) ? c.website : `https://${c.website}`)

  return (
    <div className="container page">
      <BackButton fallback="/jobs" />

      <div className="ij-company-head">
        <span className="avatar avatar-xl">
          {c.logo ? <img src={fileUrl(c.logo)} alt={`${c.name} logo`} /> : initials(c.name)}
        </span>
        <div>
          <h1>{c.name}</h1>
          <div className="ij-company-meta">
            {c.location && <span><Icon name="pin" size={15} /> {c.location}</span>}
            {site && (
              <a href={site} target="_blank" rel="noopener noreferrer">
                <Icon name="globe" size={15} /> Company website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="ij-company-grid">
        <section className="card">
          <h2 className="card-title">About {c.name}</h2>
          <p className="pre-line break">{c.description || 'This company has not added a description yet.'}</p>
        </section>

        <section>
          <h2 className="ij-h2">{jobs.data ? plural(openJobs.length, 'open job') : 'Open jobs'}</h2>
          {jobs.loading && !jobs.data && <Loader text="Loading jobs..." />}
          {jobs.data && openJobs.length === 0 && (
            <EmptyState icon="briefcase" title="No open jobs right now" text="Check back soon." />
          )}
          <div className="ij-cards">
            {openJobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </section>
      </div>
    </div>
  )
}