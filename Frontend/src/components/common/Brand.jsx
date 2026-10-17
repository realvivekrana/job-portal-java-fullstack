import { Link } from 'react-router-dom'
import Icon from './Icon'

export default function Brand({ to = '/', light = false, onClick }) {
  return (
    <Link to={to} className={`brand${light ? ' brand-light' : ''}`} onClick={onClick} aria-label="JobPortal home">
      <span className="brand-mark"><Icon name="briefcase" size={18} /></span>
      JobPortal
    </Link>
  )
}