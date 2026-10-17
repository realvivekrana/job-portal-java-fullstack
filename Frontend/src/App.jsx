import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SiteProvider } from './context/SiteContext'
import { ToastProvider } from './context/ToastContext'
import { SavedJobsProvider } from './context/SavedJobsContext'
import AppRoutes from './routes/AppRoutes'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <SiteProvider>
      <AuthProvider>
        <ToastProvider>
          <SavedJobsProvider>
            <ScrollToTop />
            <div className="app">
              <AppRoutes />
            </div>
          </SavedJobsProvider>
        </ToastProvider>
      </AuthProvider>
    </SiteProvider>
  )
}