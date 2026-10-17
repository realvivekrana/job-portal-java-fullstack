export default function StatCard({ label, value, accent = 'blue' }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <div className="num">{value ?? '-'}</div>
      <div className="lbl">{label}</div>
    </div>
  )
}