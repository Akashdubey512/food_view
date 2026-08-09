import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCurrentAccount() {
      try {
        const response = await api.get('/api/v1/me')

        setAccount(response.data.account)
      } catch (err) {
        setAccount(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentAccount()
  }, [])

  const login = (accountData) => {
    setAccount(accountData)
  }

  const logout = async () => {
    try {
      await api.get('/api/v1/auth/logout')
    } catch (err) {
      console.warn('Logout failed', err)
    }

    setAccount(null)
  }

  const value = useMemo(
    () => ({
      account,
      loading,
      isAuthenticated: Boolean(account),
      login,
      logout,
    }),
    [account, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export { AuthProvider, useAuth }
