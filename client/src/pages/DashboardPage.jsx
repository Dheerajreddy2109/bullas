import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import styles from '../css/DashboardPage.module.css'

function DashboardPage() {
  const { user } = useAuth()

  return (
    <>
      <h1 className={styles.title}>Welcome, {user.name}</h1>
      <p>Choose where to start.</p>
      <Link className={styles.card} to="/templates">
        <strong>Templates</strong>
        <span>See and preview the website templates.</span>
      </Link>
    </>
  )
}

export default DashboardPage
