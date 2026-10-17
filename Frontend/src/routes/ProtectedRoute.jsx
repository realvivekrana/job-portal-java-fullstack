import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Loader from '../components/common/Loader'

export default function ProtectedRoute() {
  const { isAuthenticated, ready } = useAuth()
  const location = useLocation()

  if (!ready) return <Loader page text="Checking your session..." />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}