import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContextValue'
import * as authApi from '../api/authApi'
import { TOKEN_KEY, USER_KEY } from '../utils/constants'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)
  const [ready, setReady] = useState(() => !localStorage.getItem(TOKEN_KEY))

  const saveSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // On app start, confirm the saved token is still valid and refresh user details
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    let cancelled = false
    authApi
      .getCurrentUser()
      .then((fresh) => {
        if (cancelled) return
        localStorage.setItem(USER_KEY, JSON.stringify(fresh))
        setUser(fresh)
      })
      .catch(() => {
        if (!cancelled) logout()
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [logout])

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials)
      saveSession(data)
      return data.user
    },
    [saveSession],
  )

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload)
      saveSession(data)
      return data.user
    },
    [saveSession],
  )

  const value = useMemo(
    () => ({ user, token, ready, isAuthenticated: Boolean(token && user), login, register, logout }),
    [user, token, ready, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}