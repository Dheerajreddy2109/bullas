import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import styles from '../css/Sidebar.module.css'

const linkClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)

function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className={styles.sidebar}>
      <p className={styles.brand}>Bullas</p>
      <nav className={styles.nav}>
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/sites" className={linkClass}>
          Sites
        </NavLink>
        <NavLink to="/templates" className={linkClass}>
          Templates
        </NavLink>
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
