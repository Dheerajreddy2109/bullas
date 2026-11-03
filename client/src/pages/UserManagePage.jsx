import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import OwnerResetForm from '../components/OwnerResetForm.jsx'
import OwnerStatusCard from '../components/OwnerStatusCard.jsx'
import TwoFactorResetCard from '../components/twofactor/TwoFactorResetCard.jsx'
import { getUser, resetUserPassword, resetUserTwoFactor, setUserDisabled } from '../services/api.js'
import styles from '../css/OwnerManagePage.module.css'

function UserManagePage() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getUser(userId)
      .then(setUser)
      .catch((err) => setError(err.message))
  }, [userId])

  return (
    <>
      <Link className={styles.back} to="/users">
        Back to users
      </Link>
      <h1 className={styles.title}>Manage builder{user && `: ${user.name}`}</h1>
      {error && <p role="alert">Could not load this user: {error}</p>}
      {!user && !error && <p>Loading...</p>}
      {user && (
        <div className={styles.columns}>
          <OwnerStatusCard
            owner={user}
            title="Builder"
            subject="builder"
            note={`Their ${user.siteCount} site(s) stay online.`}
            setDisabled={(disabled) => setUserDisabled(userId, disabled)}
            onChange={(updated) => setUser((current) => ({ ...current, ...updated }))}
          />
          <OwnerResetForm
            resetPassword={(password) => resetUserPassword(userId, password)}
            onReset={(updated) => setUser((current) => ({ ...current, ...updated }))}
          />
          <TwoFactorResetCard
            enabled={user.twoFactorEnabled}
            reset={() => resetUserTwoFactor(userId)}
            onReset={() => setUser((current) => ({ ...current, twoFactorEnabled: false }))}
          />
        </div>
      )}
    </>
  )
}

export default UserManagePage
