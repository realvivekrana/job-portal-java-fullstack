import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icon'
import { DATE_POSTED, EXPERIENCE_LEVELS, JOB_TYPES, SALARY_STEPS } from '../../utils/constants'

const TYPE_OPTIONS = [{ value: '', label: 'Any type' }, ...JOB_TYPES]

/** One Indeed style pill: shows the current choice and opens a small menu of options. */
function Pill({ label, value, options, onPick }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return undefined
    const away = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="ij-pill-wrap" ref={ref}>
      <button
        type="button"
        className={`ij-pill${value ? ' on' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {value ? current?.label : label}
        <Icon name="chevD" size={14} />
      </button>
      {open && (
        <ul className="ij-menu" role="listbox" aria-label={label}>
          {options.map((o) => (
            <li key={o.value || 'any'}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={o.value === value ? 'sel' : ''}
                onClick={() => {
                  onPick(o.value)
                  setOpen(false)
                }}
              >
                {o.label}
                {o.value === value && <Icon name="check" size={14} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function JobFilters({ filters, onChange, onReset }) {
  const active = ['jobType', 'minSalary', 'maxExperience', 'postedWithinDays'].some((k) => filters[k])
  return (
    <div className="ij-filters" role="group" aria-label="Filter jobs">
      <Pill label="Date posted" value={filters.postedWithinDays} options={DATE_POSTED}
        onPick={(v) => onChange({ postedWithinDays: v })} />
      <Pill label="Job type" value={filters.jobType} options={TYPE_OPTIONS}
        onPick={(v) => onChange({ jobType: v })} />
      <Pill label="Pay" value={filters.minSalary} options={SALARY_STEPS}
        onPick={(v) => onChange({ minSalary: v })} />
      <Pill label="Experience" value={filters.maxExperience} options={EXPERIENCE_LEVELS}
        onPick={(v) => onChange({ maxExperience: v })} />
      {active && (
        <button type="button" className="ij-reset" onClick={onReset}>
          <Icon name="x" size={14} /> Clear filters
        </button>
      )}
    </div>
  )
}