import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'
import { setUnauthorizedHandler } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { data } = await authApi.me()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => { setUnauthorizedHandler(() => setUser(null)) }, [])

  const login = useCallback(async (payload) => {
    const { data } = await authApi.login(payload)
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload)
    setUser(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } finally { setUser(null) }
  }, [])

  const value = useMemo(
    () => ({ user, setUser, loading, isAuthenticated: !!user, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
