import Icon from './Icon'

export default function StatCard({ label, value, accent = 'blue', icon = 'layers' }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <span className="stat-icon"><Icon name={icon} size={20} /></span>
      <div>
        <div className="num">{value ?? '-'}</div>
        <div className="lbl">{label}</div>
      </div>
    </div>
  )
}