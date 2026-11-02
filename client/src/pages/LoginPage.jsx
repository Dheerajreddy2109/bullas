import { Navigate, useLocation } from 'react-router-dom'
import LoginForm from '../components/LoginForm.jsx'
import { useAuth } from '../hooks/useAuth.js'
import styles from '../css/LoginPage.module.css'

function LoginPage() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (user) return <Navigate to={location.state?.from ?? '/'} replace />

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bullas Super Admin</h1>
        <LoginForm />
      </div>
    </main>
  )
}

export default LoginPage
