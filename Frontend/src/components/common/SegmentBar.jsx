/** Stacked horizontal bar with a legend. segments: [{ label, value, color }] */
export default function SegmentBar({ segments }) {
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0)
  return (
    <div>
      <div className="segbar" role="img" aria-label={segments.map((s) => `${s.label} ${s.value || 0}`).join(', ')}>
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <span key={s.label} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
            ))}
      </div>
      <div className="legend">
        {segments.map((s) => (
          <span key={s.label}>
            <i style={{ background: s.color }} />
            {s.label} <b>{s.value ?? 0}</b>
          </span>
        ))}
      </div>
    </div>
  )
}