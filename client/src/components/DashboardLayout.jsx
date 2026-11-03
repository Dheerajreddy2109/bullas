import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import styles from '../css/DashboardLayout.module.css'

function DashboardLayout({ brand, links }) {
  return (
    <div className={styles.layout}>
      <Sidebar brand={brand} links={links} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
