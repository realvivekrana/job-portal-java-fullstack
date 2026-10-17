import { useState } from 'react'
import { JOB_TYPES, SORT_OPTIONS } from '../../utils/constants'

export default function JobFilters({ filters, onChange, onReset }) {
  const [open, setOpen] = useState(false)

  return (
    <aside className="card filters">
      <div className="row row-between">
        <h3 style={{ margin: 0 }}>Filters</h3>
        <button type="button" className="btn btn-outline btn-sm filters-toggle" onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={`filters-body${open ? ' open' : ''}`}>
        <div className="field">
          <label htmlFor="f-keyword">Keyword</label>
          <input id="f-keyword" className="input" placeholder="Title, skill or company"
            value={filters.keyword} onChange={(e) => onChange({ keyword: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="f-location">Location</label>
          <input id="f-location" className="input" placeholder="City or state"
            value={filters.location} onChange={(e) => onChange({ location: e.target.value })} />
        </div>
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