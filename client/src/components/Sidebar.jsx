import { NavLink } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useSiteBranding } from '../hooks/useSiteBranding.js'
import styles from '../css/Sidebar.module.css'

// Users is only listed for the super admin; the server refuses builders anyway.
function adminLinks(role) {
  return [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/sites', label: 'Sites' },
    { to: '/templates', label: 'Templates' },
    ...(role === 'superadmin' ? [{ to: '/users', label: 'Users' }] : []),
    { to: '/change-password', label: 'Change password' },
    { to: '/two-factor', label: 'Two-factor login' },
  ]
}

// The Bullas logo belongs to the admin area only; site owners get their own branding.
const ADMIN_LOGO = '/logo.jpeg'

const linkClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)

// Links come in as a prop, so the admin area and site owners share one sidebar.
function Sidebar({ brand = 'Bullas', links }) {
  const { user, signOut } = useAuth()
  const items = links ?? adminLinks(user.role)
  const isAdminArea = !links
  // Owners see their own site's logo or name; the request is skipped for the Bullas admin area.
  const site = useSiteBranding(user.role === 'siteowner' ? user.siteId : null)

  return (
    <aside className={styles.sidebar}>
      {isAdminArea ? (
        <BrandLogo src={ADMIN_LOGO} alt="Bullas Group" to="/" />
      ) : site.logo ? (
        <BrandLogo src={site.logo} alt={`${site.name} logo`} to="/admin" />
      ) : (
        <p className={styles.brand}>{site.name || brand}</p>
      )}
      <nav className={styles.nav}>
        {items.map((link) =>
          link.external ? (
            <a key={link.to} className={styles.link} href={link.to} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ) : (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ),
        )}
      </nav>
      <div className={styles.account}>
        <span className={styles.user}>
          {user.name}
          {user.role === 'builder' && ' (builder)'}
        </span>
        <button className={styles.logout} type="button" onClick={signOut}>
          Log out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
