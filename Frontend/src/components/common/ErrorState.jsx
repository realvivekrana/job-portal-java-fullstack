import Icon, { hasIcon } from './Icon'

export default function EmptyState({ icon = 'search', title, text, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">{hasIcon(icon) ? <Icon name={icon} size={28} /> : icon}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}