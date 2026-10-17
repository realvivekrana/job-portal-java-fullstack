import { useState } from 'react'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import ConfirmModal from '../../components/common/ConfirmModal'
import useApi from '../../hooks/useApi'
import useSite from '../../hooks/useSite'
import useToast from '../../hooks/useToast'
import { getSite, updateSite } from '../../api/siteApi'
import { getErrorMessage } from '../../utils/helpers'

// What the admin can edit. `rows` makes it a textarea; the list fields take one item per line.
const SECTIONS = [
  {
    title: 'Brand',
    fields: [
      { key: 'siteName', label: 'Website name', max: 60, hint: 'Header, footer, login page and browser tab' },
      { key: 'siteTagline', label: 'Tagline', max: 100, hint: 'Shown in the browser tab after the name' },
    ],
  },
  {
    title: 'Home page',
    fields: [
      { key: 'heroTitle', label: 'Headline', max: 150 },
      { key: 'heroLead', label: 'Intro text', rows: 3, max: 400 },
      { key: 'candidatePoints', label: 'Points for candidates', rows: 4, hint: 'One point per line' },
      { key: 'recruiterPoints', label: 'Points for recruiters', rows: 4, hint: 'One point per line' },
      { key: 'ctaTitle', label: 'Bottom banner title', max: 120 },
      { key: 'ctaText', label: 'Bottom banner text', rows: 2, max: 300 },
    ],
  },
  {
    title: 'Login and register side panel',
    fields: [
      { key: 'authHeadline', label: 'Headline', max: 150 },
      { key: 'authPoints', label: 'Points', rows: 4, hint: 'One point per line' },
    ],
  },
  {
    title: 'Footer',
    fields: [
      { key: 'footerAbout', label: 'About text', rows: 3, max: 300 },
      { key: 'footerNote', label: 'Small note', max: 100, hint: 'Shown next to the copyright line. Clear it to restore the default' },
      { key: 'contactEmail', label: 'Contact email', type: 'email', max: 120, hint: 'Optional. Shown in the footer when filled' },
    ],
  },
]

const ALL_KEYS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key))

function SiteForm({ initial }) {
  const toast = useToast()
  const { applySite } = useSite()
  const [values, setValues] = useState(() => Object.fromEntries(ALL_KEYS.map((k) => [k, initial[k] ?? ''])))
  const [saving, setSaving] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const save = async (payload, message) => {
    setSaving(true)
    try {
      const saved = await updateSite(payload)
      applySite(saved)
      setValues(Object.fromEntries(ALL_KEYS.map((k) => [k, saved[k] ?? ''])))
      toast.success(message)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    save(values, 'Website content saved')
  }

  const restoreDefaults = async () => {
    setConfirmReset(false)
    await save(Object.fromEntries(ALL_KEYS.map((k) => [k, ''])), 'Default content restored')
  }

  return (
    <form className="stack" onSubmit={submit} noValidate>
      {SECTIONS.map((sec) => (
        <div className="card form" key={sec.title}>
          <h3>{sec.title}</h3>
          {sec.fields.map((f) => (
            <div className="field" key={f.key}>
              <label htmlFor={`s-${f.key}`}>{f.label}</label>
              {f.rows ? (
                <textarea id={`s-${f.key}`} className="input" rows={f.rows} maxLength={f.max || 2000}
                  value={values[f.key]} onChange={set(f.key)} />
              ) : (
                <input id={`s-${f.key}`} className="input" type={f.type || 'text'} maxLength={f.max || 200}
                  value={values[f.key]} onChange={set(f.key)} />
              )}
              {f.hint && <span className="hint">{f.hint}</span>}
            </div>
          ))}
        </div>
      ))}

      <div className="row">
        <button className="btn btn-lg" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        <button type="button" className="btn btn-outline btn-lg" disabled={saving} onClick={() => setConfirmReset(true)}>
          Restore defaults
        </button>
      </div>

      {confirmReset && (
        <ConfirmModal
          title="Restore default content?"
          message="All website texts will go back to their original values. Your jobs, users and applications are not affected."
          confirmLabel="Restore defaults"
          danger
          onConfirm={restoreDefaults}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </form>
  )
}

export default function ManageSite() {
  const { data, error, loading, reload } = useApi(() => getSite(), [])

  return (
    <div className="dash-page">
      <div className="page-header">
        <div>
          <h1>Website content</h1>
          <p>Change the texts shown on the public website. Job counts, popular searches and top companies update on their own.</p>
        </div>
      </div>
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Loader />}
      {data && <SiteForm initial={data} />}
    </div>
  )
}