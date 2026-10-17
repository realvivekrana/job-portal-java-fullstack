import { Link } from 'react-router-dom'
import useSite from '../../hooks/useSite'
import Icon from './Icon'

export default function Brand({ to = '/', light = false, onClick }) {
  const { site } = useSite()
  return (
    <Link to={to} className={`brand${light ? ' brand-light' : ''}`} onClick={onClick} aria-label={`${site.siteName} home`}>
      <span className="brand-mark"><Icon name="briefcase" size={18} /></span>
      {site.siteName}
    </Link>
  )
}