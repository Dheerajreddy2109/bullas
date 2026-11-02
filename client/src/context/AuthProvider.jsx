import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { getCurrentUser, login, logout } from '../services/api.js'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Scripts can't read an httpOnly cookie, so the only way to know who is logged in is to ask.
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn: async (email, password) => setUser(await login(email, password)),
      signOut: async () => {
        await logout()
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
