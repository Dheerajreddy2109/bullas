import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import styles from '../css/ProtectedRoute.module.css'

// A convenience only: browser code can be edited, so the server still checks every request.
// roles lists every role allowed in; leaving it out allows any logged-in user.
function ProtectedRoute({ roles, loginPath = '/login', changePasswordPath, twoFactorPath }) {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  // Waiting avoids flashing the login page at someone who is already logged in.
  if (loading) return <p>Loading...</p>
  if (!user) return <Navigate to={loginPath} replace state={{ from: location.pathname }} />

  if (roles && !roles.includes(user.role)) {
    return (
      <main className={styles.page}>
        <p>This account can't use this area.</p>
        <button className={styles.button} type="button" onClick={signOut}>
          Log out
        </button>
      </main>
    )
  }

  // The server refuses everything else until then, so the screens would only show errors.
  if (user.mustChangePassword && changePasswordPath && location.pathname !== changePasswordPath) {
    return <Navigate to={changePasswordPath} replace />
  }

  // Same idea for required two-factor login: set it up before anything else.
  if (user.twoFactorRequired && !user.twoFactorEnabled && twoFactorPath && location.pathname !== twoFactorPath) {
    return <Navigate to={twoFactorPath} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
