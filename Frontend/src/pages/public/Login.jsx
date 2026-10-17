import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1 className="center">Welcome back</h1>
        <p className="muted center">Sign in to continue to JobPortal</p>

        {searchParams.get('expired') && (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            Your session has expired. Please sign in again.
          </div>
        )}
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="l-email">Email</label>
            <input id="l-email" type="email" className="input" autoComplete="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="l-pass">Password</label>
            <input id="l-pass" type={showPassword ? 'text' : 'password'} className="input"
              autoComplete="current-password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <label className="small" style={{ fontWeight: 400 }}>
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show password
            </label>
          </div>
          <button className="btn btn-block" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
        </form>

        <p className="center small mt">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}