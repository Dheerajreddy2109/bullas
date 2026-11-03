import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import styles from '../css/ProtectedRoute.module.css'

// A convenience only: browser code can be edited, so the server still checks every request.
function ProtectedRoute({ role, loginPath = '/login', changePasswordPath }) {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  // Waiting avoids flashing the login page at someone who is already logged in.
  if (loading) return <p>Loading...</p>
  if (!user) return <Navigate to={loginPath} replace state={{ from: location.pathname }} />

  if (role && user.role !== role) {
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

  return <Outlet />
}

export default ProtectedRoute
