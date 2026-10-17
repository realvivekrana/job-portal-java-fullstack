import axios from 'axios'
import { API_BASE_URL, TOKEN_KEY, USER_KEY } from '../utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    // Expired / invalid token on a protected call: clear session and go to login
    if (status === 401 && !url.includes('/api/auth/')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?expired=1')
      }
    }
    return Promise.reject(error)
  },
)

export default api