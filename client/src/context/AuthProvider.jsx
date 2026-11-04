import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import {
  LOGGED_OUT_EVENT,
  changePassword,
  getCurrentUser,
  login,
  logout,
  verifyTwoFactor,
} from '../services/api.js'

// Lets tabs of the same address tell each other about a logout. Each address has its own channel,
// so logging out of the admin area doesn't touch a site owner's tab.
const CHANNEL_NAME = 'bullas-auth'

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

  // Any tab logging out, or any request finding the session ended, sends every tab to the login page.
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    const loggedOut = () => setUser(null)
    channel.onmessage = (event) => {
      if (event.data === 'logout') loggedOut()
    }
    window.addEventListener(LOGGED_OUT_EVENT, loggedOut)
    return () => {
      channel.close()
      window.removeEventListener(LOGGED_OUT_EVENT, loggedOut)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      // Returns 'code' when the password was right but a 2FA code is still needed.
      signIn: async (email, password) => {
        const result = await login(email, password)
        if (!result.email) return 'code'
        setUser(result)
        return 'done'
      },
      verifyCode: async (code) => setUser(await verifyTwoFactor(code)),
      // For pages that change the account, such as turning 2FA on, so the screens update at once.
      updateUser: setUser,
      signOut: async () => {
        await logout()
        setUser(null)
        const channel = new BroadcastChannel(CHANNEL_NAME)
        channel.postMessage('logout')
        channel.close()
      },
      changePassword: async (currentPassword, newPassword) =>
        setUser(await changePassword(currentPassword, newPassword)),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
