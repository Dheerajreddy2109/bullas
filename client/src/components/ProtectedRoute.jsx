import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// A convenience only: browser code can be edited, so the server still checks every request.
function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Waiting avoids flashing the login page at someone who is already logged in.
  if (loading) return <p>Loading...</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export default ProtectedRoute
