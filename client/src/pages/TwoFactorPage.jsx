import { useState } from 'react'
import BackupCodesBox from '../components/twofactor/BackupCodesBox.jsx'
import TwoFactorDisableForm from '../components/twofactor/TwoFactorDisableForm.jsx'
import TwoFactorSetup from '../components/twofactor/TwoFactorSetup.jsx'
import { useAuth } from '../hooks/useAuth.js'
import styles from '../css/TwoFactorPage.module.css'

// Shared by the admin area and site owners; it only works on the logged-in account.
function TwoFactorPage() {
  const { user, updateUser } = useAuth()
  // Kept here, not in the user, so the codes are shown only until "I've saved them".
  const [backupCodes, setBackupCodes] = useState(null)
  const [pendingUser, setPendingUser] = useState(null)

  // The new login state is applied only after the codes are saved; applying it at once would
  // let a required-2FA redirect move the person away before they saw their codes.
  function handleEnabled({ backupCodes: codes, user: updated }) {
    setBackupCodes(codes)
    setPendingUser(updated)
  }

  function handleSaved() {
    setBackupCodes(null)
    updateUser(pendingUser)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Two-factor login</h1>
      <p className={styles.intro}>
        After your password, you'll also enter a 6-digit code from your phone, so a stolen password alone can't
        get into your account.
      </p>

      {backupCodes ? (
        <BackupCodesBox codes={backupCodes} onDone={handleSaved} />
      ) : user.twoFactorEnabled ? (
        <>
          <p className={styles.on}>Two-factor login is on.</p>
          {user.twoFactorRequired ? (
            <p className={styles.note}>It's required for your account, so it can't be turned off.</p>
          ) : (
            <TwoFactorDisableForm onDisabled={updateUser} />
          )}
        </>
      ) : (
        <>
          {user.twoFactorRequired && (
            <p className={styles.required}>Your account must use two-factor login. Set it up to continue.</p>
          )}
          <TwoFactorSetup onEnabled={handleEnabled} />
        </>
      )}
    </div>
  )
}

export default TwoFactorPage
