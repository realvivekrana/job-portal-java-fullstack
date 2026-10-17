export default function Loader({ text = 'Loading...', page = false, small = false }) {
  if (small) return <span className="spinner spinner-sm" role="status" aria-label={text} />
  return (
    <div className={`loader-wrap${page ? ' page-loader' : ''}`} role="status">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  )
}