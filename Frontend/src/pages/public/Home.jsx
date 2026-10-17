import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import JobCard from '../../components/job/JobCard'
import Icon from '../../components/common/Icon'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import { searchJobs } from '../../api/jobApi'
import { JOB_TYPES, ROLE_HOME } from '../../utils/constants'
import { formatSalary, initials } from '../../utils/helpers'

const POPULAR = ['Java Developer', 'React', 'Fresher', 'Pune', 'Remote']
const TYPE_ICONS = { FULL_TIME: 'briefcase', PART_TIME: 'clock', INTERNSHIP: 'cap', REMOTE: 'laptop', CONTRACT: 'file' }

const CANDIDATE_POINTS = [
  'Filter by skill, location, job type and salary',
  'Apply with a saved resume and a short cover letter',
  'Track every application from applied to hired',
]
const RECRUITER_POINTS = [
  'Create your company page and post jobs in minutes',
  'Review applicants and open resumes in one click',
  'Shortlist, hire or reject with automatic email updates',
]

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const { data, error, loading, reload } = useApi(() => searchJobs({ size: 6 }), [])

  const search = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('keyword', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(`/jobs?${params.toString()}`)
  }

  const latest = data?.content?.slice(0, 3) || []

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Find work you want to wake up for.</h1>
            <p className="hero-lead">
              Search openings from companies that are hiring now, apply in a couple of taps and follow every
              application in one place.
            </p>

            <form className="search-bar" onSubmit={search} role="search">
              <label className="input-icon">
                <span className="sr-only">Job title, skill or company</span>
                <Icon name="search" size={18} />
                <input className="input" placeholder="Job title, skill or company" value={keyword}
                  onChange={(e) => setKeyword(e.target.value)} />
              </label>
              <label className="input-icon">
                <span className="sr-only">City or state</span>
                <Icon name="pin" size={18} />
                <input className="input" placeholder="City or state" value={location}
                  onChange={(e) => setLocation(e.target.value)} />
              </label>
              <button className="btn btn-lg">Search jobs</button>
            </form>

            <div className="popular">
              <span>Popular:</span>
              {POPULAR.map((p) => (
                <Link key={p} to={`/jobs?keyword=${encodeURIComponent(p)}`}>{p}</Link>
              ))}
            </div>
          </div>

          {latest.length > 0 && (
            <aside className="hero-panel" aria-label="Latest openings">
              <h3>
                Latest openings
                <span className="badge badge-active">{data.totalElements} open</span>
              </h3>
              {latest.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="mini-job">
                  <span className="avatar">{initials(job.companyName)}</span>
                  <span>
                    <strong>{job.title}</strong>
                    <span className="sub">
                      {job.companyName} · {job.location} · {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                  </span>
                </Link>
              ))}
              <Link to="/jobs" className="btn btn-outline btn-block" style={{ marginTop: '.5rem' }}>
                See all jobs <Icon name="arrowR" size={16} />
              </Link>
            </aside>
          )}
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <h2>Browse by job type</h2>
          </div>
          <div className="type-grid">
            {JOB_TYPES.map((t) => (
              <Link key={t.value} to={`/jobs?jobType=${t.value}`} className="type-tile">
                <span className="ico"><Icon name={TYPE_ICONS[t.value] || 'briefcase'} size={22} /></span>
                <span>
                  {t.label}
                  <br />
                  <small>View openings</small>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>Latest jobs</h2>
              {data && <p className="muted">{data.totalElements} open positions</p>}
            </div>
            <Link to="/jobs" className="btn btn-outline btn-sm">View all <Icon name="arrowR" size={16} /></Link>
          </div>

          {loading && <Loader text="Loading jobs..." />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && data.content.length === 0 && (
            <EmptyState icon="search" title="No jobs posted yet" text="Check back soon for new openings." />
          )}
          {data && data.content.length > 0 && (
            <div className="job-list">
              {data.content.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-head"><h2>Built for both sides of hiring</h2></div>
          <div className="audience">
            <div className="card">
              <h3>For candidates</h3>
              <ul>
                {CANDIDATE_POINTS.map((p) => (<li key={p}><Icon name="check" size={18} /><span>{p}</span></li>))}
              </ul>
              <Link to="/register" className="btn">Create candidate account</Link>
            </div>
            <div className="card dark">
              <h3>For recruiters</h3>
              <ul>
                {RECRUITER_POINTS.map((p) => (<li key={p}><Icon name="check" size={18} /><span>{p}</span></li>))}
              </ul>
              <Link to="/register?role=recruiter" className="btn btn-accent">Start hiring</Link>
            </div>
          </div>
        </section>

        <section className="cta">
          {isAuthenticated ? (
            <>
              <h2>Welcome back, {user.name.split(' ')[0]}</h2>
              <p>Pick up where you left off.</p>
              <Link to={ROLE_HOME[user.role]} className="btn btn-lg">Go to your dashboard</Link>
            </>
          ) : (
            <>
              <h2>Ready to get started?</h2>
              <p>Join as a candidate to apply, or as a recruiter to start hiring.</p>
              <div className="row" style={{ justifyContent: 'center' }}>
                <Link to="/register" className="btn btn-lg">Create free account</Link>
                <Link to="/login" className="btn btn-outline btn-lg">Log in</Link>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  )
}