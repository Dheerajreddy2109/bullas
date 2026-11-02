import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import styles from '../css/DashboardLayout.module.css'

function DashboardLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
