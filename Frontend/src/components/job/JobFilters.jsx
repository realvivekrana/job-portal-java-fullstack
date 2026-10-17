import { useEffect, useState } from 'react'
import Icon from '../common/Icon'
import useSite from '../../hooks/useSite'
import { JOB_TYPES, SORT_OPTIONS } from '../../utils/constants'

export default function JobFilters({ filters, onChange, onReset }) {
  const [open, setOpen] = useState(false)
  const { overview, refreshOverview } = useSite()
  useEffect(() => {
    if (!overview) refreshOverview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const activeCount = ['keyword', 'location', 'jobType', 'minSalary', 'maxExperience'].filter((k) => filters[k]).length

  return (
    <aside className="card filters">
      <div className="row row-between">
        <h3 style={{ margin: 0 }}>
          <Icon name="filter" size={17} /> Filters {activeCount > 0 && <span className="badge badge-new">{activeCount}</span>}
        </h3>
        <button type="button" className="btn btn-outline btn-sm filters-toggle" aria-expanded={open}
          onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={`filters-body${open ? ' open' : ''}`}>
        <div className="field">
          <label htmlFor="f-keyword">Keyword</label>
          <input id="f-keyword" className="input" list="f-keyword-list" placeholder="Title, skill or company"
            value={filters.keyword} onChange={(e) => onChange({ keyword: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="f-location">Location</label>
          <input id="f-location" className="input" list="f-location-list" placeholder="City or state"
            value={filters.location} onChange={(e) => onChange({ location: e.target.value })} />
        </div>
        <datalist id="f-keyword-list">
          {(overview?.popularSkills || []).map((k) => <option key={k} value={k} />)}
        </datalist>
        <datalist id="f-location-list">
          {(overview?.popularLocations || []).map((l) => <option key={l} value={l} />)}
        </datalist>
        <div className="field">
          <label htmlFor="f-type">Job type</label>
          <select id="f-type" className="input" value={filters.jobType}
            onChange={(e) => onChange({ jobType: e.target.value })}>
            <option value="">All types</option>
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-salary">Minimum salary (₹)</label>
          <input id="f-salary" type="number" min="0" step="10000" className="input" placeholder="e.g. 300000"
            value={filters.minSalary} onChange={(e) => onChange({ minSalary: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="f-exp">Max experience required (years)</label>
          <input id="f-exp" type="number" min="0" max="50" className="input" placeholder="e.g. 2"
            value={filters.maxExperience} onChange={(e) => onChange({ maxExperience: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="f-sort">Sort by</label>
          <select id="f-sort" className="input" value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value })}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-outline" onClick={onReset}>Clear all filters</button>
      </div>
    </aside>
  )
}