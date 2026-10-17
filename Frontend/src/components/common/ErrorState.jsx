import { getErrorMessage } from '../../utils/helpers'

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="alert alert-error row row-between">
      <span>{getErrorMessage(error)}</span>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}