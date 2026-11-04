import { Navigate, useLocation } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo.jsx'
import LoginForm from '../components/LoginForm.jsx'
import { useAuth } from '../hooks/useAuth.js'
import styles from '../css/LoginPage.module.css'

// logo is optional: only the Bullas admin login passes one for now.
function LoginPage({ title = 'Bullas Super Admin', homePath = '/', logo, logoAlt = '' }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (user) return <Navigate to={location.state?.from ?? homePath} replace />

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {logo && <BrandLogo src={logo} alt={logoAlt} size="login" />}
        <h1 className={styles.title}>{title}</h1>
        <LoginForm />
      </div>
    </main>
  )
}

export default LoginPage
