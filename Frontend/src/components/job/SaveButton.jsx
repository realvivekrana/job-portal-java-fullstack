import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../common/Icon'
import useAuth from '../../hooks/useAuth'
import useSavedJobs from '../../hooks/useSavedJobs'

/** Indeed style bookmark. Guests are sent to log in; recruiters and admins do not see it. */
export default function SaveButton({ jobId, withLabel = false }) {
  const { isAuthenticated } = useAuth()
  const { enabled, isSaved, toggle } = useSavedJobs()
  const navigate = useNavigate()
  const location = useLocation()

  if (isAuthenticated && !enabled) return null
  const saved = enabled && isSaved(jobId)

  const click = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }
    toggle(jobId)
  }

  return (
    <button
      type="button"
      className={`ij-save${saved ? ' saved' : ''}${withLabel ? ' with-label' : ''}`}
      onClick={click}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
    >
      <Icon name="bookmark" size={20} className={saved ? 'fill' : ''} />
      {withLabel && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  )
}