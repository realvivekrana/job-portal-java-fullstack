import { useState } from 'react'
import Icon from '../common/Icon'

/** "What" and "Where" search, the same two box layout Indeed uses. */
export default function SearchBar({ keyword = '', location = '', onSearch, big = false, suggestions = {} }) {
  const [what, setWhat] = useState(keyword)
  const [where, setWhere] = useState(location)

  const submit = (e) => {
    e.preventDefault()
    onSearch({ keyword: what.trim(), location: where.trim() })
  }

  return (
    <form className={`ij-search${big ? ' big' : ''}`} onSubmit={submit} role="search">
      <label className="ij-search-field">
        <span className="sr-only">What: job title, keywords or company</span>
        <Icon name="search" size={20} />
        <input
          placeholder="Job title, keywords, or company"
          value={what}
          list="ij-what-list"
          onChange={(e) => setWhat(e.target.value)}
        />
        {what && (
          <button type="button" className="ij-clear" aria-label="Clear job search" onClick={() => setWhat('')}>
            <Icon name="x" size={16} />
          </button>
        )}
      </label>
      <label className="ij-search-field">
        <span className="sr-only">Where: city or state</span>
        <Icon name="pin" size={20} />
        <input
          placeholder="City or state"
          value={where}
          list="ij-where-list"
          onChange={(e) => setWhere(e.target.value)}
        />
        {where && (
          <button type="button" className="ij-clear" aria-label="Clear location" onClick={() => setWhere('')}>
            <Icon name="x" size={16} />
          </button>
        )}
      </label>
      <button className="btn ij-search-btn">Find jobs</button>
      <datalist id="ij-what-list">
        {(suggestions.skills || []).map((k) => <option key={k} value={k} />)}
      </datalist>
      <datalist id="ij-where-list">
        {(suggestions.locations || []).map((l) => <option key={l} value={l} />)}
      </datalist>
    </form>
  )
}