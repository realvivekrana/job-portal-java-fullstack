import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import useAuth from '../../hooks/useAuth'
import useToast from '../../hooks/useToast'
import { ROLE_HOME } from '../../utils/constants'
import { getErrorMessage } from '../../utils/helpers'

export default function Login() {
  const { login, isAuthenticated, user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) return setError('Please enter your email and password.')
    setSubmitting(true)
    setError('')
    try {
      const loggedIn = await login({ email: form.email.trim(), password: form.password })
      toast.success(`Welcome back, ${loggedIn.name.split(' ')[0]}!`)
      navigate(location.state?.from || ROLE_HOME[loggedIn.role] || '/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'))
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Welcome back</h1>
      <p className="muted">Log in to continue to JobPortal.</p>

      {searchParams.get('expired') && (
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          Your session has expired. Please log in again.
        </div>
      )}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="l-email">Email</label>
          <span className="input-icon">
            <Icon name="mail" size={18} />
            <input id="l-email" type="email" className="input" autoComplete="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </span>
        </div>
        <div className="field">
          <label htmlFor="l-pass">Password</label>
          <span className="input-icon">
            <input id="l-pass" type={showPassword ? 'text' : 'password'} className="input" style={{ paddingLeft: '.85rem', paddingRight: '3rem' }}
              autoComplete="current-password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="icon-btn pass-toggle" style={{ border: 'none', width: 38, height: 38 }}
              aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)}>
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </span>
        </div>
        <button className="btn btn-block btn-lg" disabled={submitting}>{submitting ? 'Logging in...' : 'Log in'}</button>
      </form>

      <p className="center small mt">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  )
}