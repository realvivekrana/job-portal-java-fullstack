import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ROLE_HOME } from '../utils/constants'

/** Allows only the given roles; other logged-in users go to their own dashboard. */
export default function RoleRoute({ roles }) {
  const { user } = useAuth()
  if (!roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />
  return <Outlet />
}