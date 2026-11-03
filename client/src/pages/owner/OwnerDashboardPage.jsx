import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import styles from '../../css/owner/OwnerDashboardPage.module.css'

function OwnerDashboardPage() {
  const { user } = useAuth()

  return (
    <>
      <h1 className={styles.title}>Welcome, {user.name}</h1>
      <p>Manage your website from here.</p>
      <div className={styles.cards}>
        <Link className={styles.card} to="/admin/content">
          <strong>Edit website</strong>
          <span>Change text, banners, images, colours and contact details.</span>
        </Link>
        <Link className={styles.card} to="/admin/blog">
          <strong>Blog</strong>
          <span>Write, publish and remove posts.</span>
        </Link>
        <a className={styles.card} href="/" target="_blank" rel="noopener noreferrer">
          <strong>View website</strong>
          <span>See your live site as visitors do.</span>
        </a>
      </div>
    </>
  )
}

export default OwnerDashboardPage
