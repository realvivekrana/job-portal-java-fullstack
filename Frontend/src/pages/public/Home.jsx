import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import JobCard from '../../components/job/JobCard'
import SearchBar from '../../components/job/SearchBar'
import Icon from '../../components/common/Icon'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import useSite from '../../hooks/useSite'
import { searchJobs } from '../../api/jobApi'
import { JOB_TYPES, ROLES, ROLE_HOME } from '../../utils/constants'
import { fileUrl, initials, plural } from '../../utils/helpers'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { site, overview, refreshOverview } = useSite()
  const { data, error, loading, reload } = useApi(() => searchJobs({ size: 6 }), [])

  useEffect(() => {
    refreshOverview()
  }, [refreshOverview])

  const go = ({ keyword, location }) => {
    const p = new URLSearchParams()
    if (keyword) p.set('keyword', keyword)
    if (location) p.set('location', location)
    navigate(`/jobs?${p.toString()}`)
  }

  const typeCounts = Object.fromEntries((overview?.jobTypes || []).map((t) => [t.type, t.count]))
  const skills = overview?.popularSkills || []
  const cities = overview?.popularLocations || []
  const companies = overview?.topCompanies || []
  const stats = overview?.stats
  const isCandidate = isAuthenticated && user.role === ROLES.CANDIDATE

  return (
    <>
      <section className="ij-hero">
        <div className="container">
          <h1>{site.heroTitle}</h1>
          <SearchBar big onSearch={go} suggestions={{ skills, locations: cities }} />
          <p className="ij-hero-sub">
            {isCandidate ? (
              <Link to="/candidate/profile">Update your resume</Link>
            ) : (
              <>
                <Link to="/register">Upload your resume</Link> to apply faster, or{' '}
                <Link to="/register?role=recruiter">post a job</Link>
              </>
            )}
          </p>

          {(skills.length > 0 || cities.length > 0) && (
            <div className="ij-popular">
              <span>Popular searches</span>
              {skills.slice(0, 6).map((p) => (
                <Link key={`k-${p}`} to={`/jobs?keyword=${encodeURIComponent(p)}`}>{p}</Link>
              ))}
              {cities.slice(0, 4).map((p) => (
                <Link key={`l-${p}`} to={`/jobs?location=${encodeURIComponent(p)}`}>Jobs in {p}</Link>
              ))}
            </div>
          )}

          {stats && (
            <dl className="ij-stats">
              <div><dd>{stats.openJobs}</dd><dt>jobs</dt></div>
              <div><dd>{stats.hiringCompanies}</dd><dt>companies hiring</dt></div>
              <div><dd>{stats.candidates}</dd><dt>job seekers</dt></div>
            </dl>
          )}
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Recent jobs</h2>
              <p className="muted">Fresh openings from employers hiring now</p>
            </div>
            <Link to="/jobs" className="ij-more">See all jobs <Icon name="arrowR" size={16} /></Link>
          </div>
          {loading && <Loader text="Loading jobs..." />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && data.content.length === 0 && (
            <EmptyState icon="search" title="No jobs posted yet" text="Check back soon for new openings." />
          )}
          {data && data.content.length > 0 && (
            <div className="ij-grid">
              {data.content.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-head"><h2>Browse jobs by type</h2></div>
          <div className="ij-tiles">
            {JOB_TYPES.map((t) => (
              <Link key={t.value} to={`/jobs?jobType=${t.value}`} className="ij-tile">
                <strong>{t.label}</strong>
                <span>{overview ? (typeCounts[t.value] ? plural(typeCounts[t.value], 'job') : 'No jobs yet') : 'View jobs'}</span>
              </Link>
            ))}
          </div>
        </section>

        {companies.length > 0 && (
          <section className="section">
            <div className="section-head">
              <div>
                <h2>Companies hiring now</h2>
                <p className="muted">Explore employers with open positions</p>
              </div>
            </div>
            <div className="company-grid">
              {companies.map((c) => (
                <Link key={c.id} to={`/companies/${c.id}`} className="company-tile">
                  <span className="avatar avatar-lg">
                    {c.logo ? <img src={fileUrl(c.logo)} alt="" loading="lazy" /> : initials(c.name)}
                  </span>
                  <strong>{c.name}</strong>
                  <small className="muted">{plural(c.openJobs, 'job')}{c.location ? ` · ${c.location}` : ''}</small>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="ij-employer">
          <div>
            <h2>Hiring? Post a job and reach job seekers today</h2>
            <p>Create your company page, post openings in minutes and move candidates from applied to hired.</p>
          </div>
          {isAuthenticated ? (
            <Link to={ROLE_HOME[user.role]} className="btn btn-lg">Go to your dashboard</Link>
          ) : (
            <Link to="/register?role=recruiter" className="btn btn-lg">Post a job</Link>
          )}
        </section>
      </div>
    </>
  )
}