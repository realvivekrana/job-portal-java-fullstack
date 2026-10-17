import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import useAuth from '../../hooks/useAuth'
import useToast from '../../hooks/useToast'
import { ROLE_HOME, ROLES } from '../../utils/constants'
import { getErrorMessage, getFieldErrors } from '../../utils/helpers'

export default function Register() {
  const { register, isAuthenticated, user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: searchParams.get('role') === 'recruiter' ? ROLES.RECRUITER : ROLES.CANDIDATE,
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const validate = () => {
    const er = {}
    const name = form.name.trim()
    if (name.length < 2 || name.length > 100) er.name = 'Name must be 2 to 100 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = 'Enter a valid email address'
    if (form.password.length < 8 || form.password.length > 72) er.password = 'Password must be 8 to 72 characters'
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match'
    return er
  }

  const submit = async (e) => {
    e.preventDefault()
    const er = validate()
    setErrors(er)
    setFormError('')
    if (Object.keys(er).length) return
    setSubmitting(true)
    try {
      const created = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      toast.success('Account created. Welcome to JobPortal!')
      navigate(created.role === ROLES.RECRUITER ? '/recruiter/company' : ROLE_HOME[created.role], { replace: true })
    } catch (err) {
      setErrors(getFieldErrors(err))
      setFormError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  const cls = (f) => `input${errors[f] ? ' invalid' : ''}`

  return (
    <div className="auth-card">
        <h1>Create your account</h1>
        <p className="muted">It only takes a minute.</p>

        {formError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>}

        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <label>I want to</label>
            <div className="role-picker">
              <button type="button" className={`role-option${form.role === ROLES.CANDIDATE ? ' active' : ''}`}
                onClick={() => setForm({ ...form, role: ROLES.CANDIDATE })}>
                <Icon name="search" size={20} /><strong>Find a job</strong><span>Candidate</span>
              </button>
              <button type="button" className={`role-option${form.role === ROLES.RECRUITER ? ' active' : ''}`}
                onClick={() => setForm({ ...form, role: ROLES.RECRUITER })}>
                <Icon name="building" size={20} /><strong>Hire talent</strong><span>Recruiter</span>
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="r-name">Full name</label>
            <input id="r-name" className={cls('name')} autoComplete="name" value={form.name} onChange={set('name')} />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="r-email">Email</label>
            <input id="r-email" type="email" className={cls('email')} autoComplete="email" value={form.email}
              onChange={set('email')} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="r-pass">Password</label>
            <input id="r-pass" type="password" className={cls('password')} autoComplete="new-password"
              value={form.password} onChange={set('password')} />
            <span className="hint">At least 8 characters</span>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <div className="field">
            <label htmlFor="r-confirm">Confirm password</label>
            <input id="r-confirm" type="password" className={cls('confirm')} autoComplete="new-password"
              value={form.confirm} onChange={set('confirm')} />
            {errors.confirm && <span className="error-text">{errors.confirm}</span>}
          </div>

          <button className="btn btn-block btn-lg" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>
        </form>

        <p className="center small mt">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
    </div>
  )
}