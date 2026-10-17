import { useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import useApi from '../../hooks/useApi'
import useToast from '../../hooks/useToast'
import { createCompany, getMyCompany, updateCompany, uploadLogo } from '../../api/companyApi'
import { LOGO_EXTENSIONS, MAX_FILE_SIZE } from '../../utils/constants'
import { fileUrl, getErrorMessage, getFieldErrors, initials, validateFile } from '../../utils/helpers'

function CompanyForm({ company, onSaved }) {
  const toast = useToast()
  const isEdit = Boolean(company)
  const [values, setValues] = useState({
    name: company?.name || '',
    description: company?.description || '',
    website: company?.website || '',
    location: company?.location || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (f) => (e) => {
    setValues((v) => ({ ...v, [f]: e.target.value }))
    setErrors((er) => ({ ...er, [f]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!values.name.trim()) return setErrors({ name: 'Company name is required' })
    setSaving(true)
    try {
      const payload = { ...values, name: values.name.trim() }
      const saved = isEdit ? await updateCompany(payload) : await createCompany(payload)
      toast.success(isEdit ? 'Company updated' : 'Company created. You can now post jobs!')
      onSaved(saved)
    } catch (err) {
      setErrors(getFieldErrors(err))
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const cls = (f) => `input${errors[f] ? ' invalid' : ''}`

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h3>Company details</h3>
      <div className="field">
        <label htmlFor="c-name">Company name *</label>
        <input id="c-name" className={cls('name')} maxLength={150} value={values.name} onChange={set('name')} />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>
      <div className="form-grid cols-2">
        <div className="field">
          <label htmlFor="c-loc">Location</label>
          <input id="c-loc" className={cls('location')} value={values.location} onChange={set('location')} placeholder="Pune, Maharashtra" />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>
        <div className="field">
          <label htmlFor="c-web">Website</label>
          <input id="c-web" className={cls('website')} value={values.website} onChange={set('website')} placeholder="https://example.com" />
          {errors.website && <span className="error-text">{errors.website}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-desc">About the company</label>
        <textarea id="c-desc" className={cls('description')} rows={6} maxLength={5000} value={values.description}
          onChange={set('description')} placeholder="What does your company do?" />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>
      <div><button className="btn" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create company'}</button></div>
    </form>
  )
}

function LogoCard({ company, onChange }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const logo = fileUrl(company.logo)

  const onFile = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    const problem = validateFile(file, LOGO_EXTENSIONS, MAX_FILE_SIZE)
    if (problem) return toast.error(problem)
    setBusy(true)
    try {
      onChange(await uploadLogo(file))
      toast.success('Logo updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <h3>Company logo</h3>
      <div className="logo-box">
        <span className="avatar avatar-lg">
          {logo ? <img src={logo} alt="Company logo" /> : initials(company.name)}
        </span>
        <div className="field">
          <label htmlFor="c-logo">Upload a logo (PNG, JPG or WEBP, max 5 MB)</label>
          <input id="c-logo" type="file" className="input" accept=".png,.jpg,.jpeg,.webp" onChange={onFile} disabled={busy} />
          {busy && <span className="hint">Uploading...</span>}
        </div>
      </div>
    </div>
  )
}

export default function CompanyProfile() {
  const { data, error, loading, reload } = useApi(
    () => getMyCompany().catch((e) => (e.response?.status === 404 ? null : Promise.reject(e))),
    [],
  )
  const [override, setOverride] = useState(null)
  const company = override || data

  if (loading && !company && !error) return <Loader page />
  if (error) return <div className="container page"><ErrorState error={error} onRetry={reload} /></div>

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>{company ? 'Company profile' : 'Create your company'}</h1>
          <p>{company ? 'Candidates see these details on your job posts.' : 'Add your company details to start posting jobs.'}</p>
        </div>
        {company && <Link to="/recruiter/jobs/new" className="btn">Post a job</Link>}
      </div>
      <div className="stack">
        {company && <LogoCard company={company} onChange={setOverride} />}
        <CompanyForm key={company?.id || 'new'} company={company} onSaved={setOverride} />
      </div>
    </div>
  )
}