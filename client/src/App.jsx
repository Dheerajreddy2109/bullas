import AdminApp from './apps/AdminApp.jsx'
import SiteApp from './apps/SiteApp.jsx'
import HomePage from './pages/HomePage.jsx'

// The address decides which app loads, the same way the server decides which site it serves.
// Set VITE_ROOT_DOMAIN to bullas.in when building for the live server.
const ROOT_DOMAIN = (import.meta.env.VITE_ROOT_DOMAIN ?? 'localhost').toLowerCase()
const hostname = window.location.hostname.toLowerCase()

function App() {
  if (hostname === `admin.${ROOT_DOMAIN}`) return <AdminApp />
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}` || hostname === '127.0.0.1') {
    return <HomePage />
  }
  return <SiteApp />
}

export default App
