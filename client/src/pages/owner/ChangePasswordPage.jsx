import { useState } from 'react'
import { Link } from 'react-router-dom'
import ChangePasswordForm from '../../components/ChangePasswordForm.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import styles from '../../css/owner/ChangePasswordPage.module.css'

function ChangePasswordPage() {
  const { user } = useAuth()
  const [done, setDone] = useState(false)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Change password</h1>
      {user.mustChangePassword && !done && (
        <p className={styles.notice}>
          You're using a temporary password. Choose your own before you can edit your website.
        </p>
      )}
      {done ? (
        <p className={styles.success}>
          Password changed. Any other logged-in browsers have been logged out.{' '}
          <Link to="/admin">Go to your dashboard</Link>
        </p>
      ) : (
        <ChangePasswordForm onChanged={() => setDone(true)} />
      )}
    </div>
  )
}

export default ChangePasswordPage
