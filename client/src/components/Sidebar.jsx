import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import styles from '../css/Sidebar.module.css'

const ADMIN_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/sites', label: 'Sites' },
  { to: '/templates', label: 'Templates' },
]

const linkClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)

// Links come in as a prop, so the super admin and site owners share one sidebar.
function Sidebar({ brand = 'Bullas', links = ADMIN_LINKS }) {
  const { user, signOut } = useAuth()

  return (
    <aside className={styles.sidebar}>
      <p className={styles.brand}>{brand}</p>
      <nav className={styles.nav}>
        {links.map((link) =>
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
        <span className={styles.user}>{user.name}</span>
        <button className={styles.logout} type="button" onClick={signOut}>
          Log out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
