import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import JobCard from '../../components/job/JobCard'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import { searchJobs } from '../../api/jobApi'
import { ROLE_HOME } from '../../utils/constants'

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

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Find the job you love. Hire the people you need.</h1>
          <p>
            Search openings from companies hiring right now, apply in a couple of clicks and track every
            application in one place.
          </p>
          <form className="search-bar" onSubmit={search} role="search">
            <input className="input" placeholder="Job title, skill or company" value={keyword}
              onChange={(e) => setKeyword(e.target.value)} aria-label="Keyword" />
            <input className="input" placeholder="City or state" value={location}
              onChange={(e) => setLocation(e.target.value)} aria-label="Location" />
            <button className="btn">Search jobs</button>
          </form>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Latest jobs</h2>
              {data && <p className="muted" style={{ margin: 0 }}>{data.totalElements} open positions</p>}
            </div>
            <Link to="/jobs" className="btn btn-outline">View all jobs</Link>
          </div>

          {loading && <Loader text="Loading jobs..." />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && data.content.length === 0 && (
            <EmptyState icon="🔎" title="No jobs posted yet" text="Check back soon for new openings." />
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
          <h2 className="center">How it works</h2>
          <div className="steps-grid mt">
            <div className="card">
              <div className="step-num">1</div>
              <h3>Create an account</h3>
              <p className="muted">Sign up as a candidate or a recruiter in less than a minute.</p>
            </div>
            <div className="card">
              <div className="step-num">2</div>
              <h3>Search or post jobs</h3>
              <p className="muted">Candidates filter by skill, location and salary. Recruiters publish roles for their company.</p>
            </div>
            <div className="card">
              <div className="step-num">3</div>
              <h3>Apply and hire</h3>
              <p className="muted">Apply with your resume, then follow your status as recruiters shortlist and hire.</p>
            </div>
          </div>
        </section>

        <section className="cta">
          {isAuthenticated ? (
            <>
              <h2>Welcome back, {user.name.split(' ')[0]}</h2>
              <Link to={ROLE_HOME[user.role]} className="btn">Go to your dashboard</Link>
            </>
          ) : (
            <>
              <h2>Ready to get started?</h2>
              <p className="muted">Join as a candidate to apply, or as a recruiter to start hiring.</p>
              <div className="row" style={{ justifyContent: 'center' }}>
                <Link to="/register" className="btn">Create free account</Link>
                <Link to="/login" className="btn btn-outline">Sign in</Link>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  )
}