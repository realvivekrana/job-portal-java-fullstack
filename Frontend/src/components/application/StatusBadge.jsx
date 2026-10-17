import { APPLICATION_STATUSES } from '../../utils/constants'

export default function StatusBadge({ status }) {
  const label = APPLICATION_STATUSES.find((s) => s.value === status)?.label || status
  return <span className={`badge badge-${String(status).toLowerCase()}`}>{label}</span>
}