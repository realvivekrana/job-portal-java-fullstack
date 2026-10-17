import { useNavigate } from 'react-router-dom'

export default function BackButton({ fallback = '/' }) {
  const navigate = useNavigate()
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate(fallback))
  return (
    <button type="button" className="btn btn-ghost btn-sm back-btn" onClick={goBack}>
      ← Back
    </button>
  )
}