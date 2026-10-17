import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

export default function BackButton({ fallback = '/' }) {
  const navigate = useNavigate()
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate(fallback))
  return (
    <button type="button" className="btn btn-ghost btn-sm back-btn" onClick={goBack}>
      <Icon name="arrowL" size={16} /> Back
    </button>
  )
}