import { useState } from 'react'
import styles from '../../css/twofactor/TwoFactorResetCard.module.css'

// For the super admin, when someone loses both their phone and backup codes.
function TwoFactorResetCard({ enabled, reset, onReset }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleReset() {
    setError('')
    setBusy(true)
    try {
      await reset()
      setConfirming(false)
      onReset()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Two-factor login</h2>
      <p className={styles.status}>{enabled ? 'On' : 'Off'}</p>
      {enabled &&
        (confirming ? (
          <div className={styles.actions}>
            <span>Reset it? They'll be logged out and must set it up again.</span>
            <button className={styles.danger} type="button" disabled={busy} onClick={handleReset}>
              Yes, reset
            </button>
            <button className={styles.secondary} type="button" onClick={() => setConfirming(false)}>
              No
            </button>
          </div>
        ) : (
          <button className={styles.secondary} type="button" onClick={() => setConfirming(true)}>
            Reset two-factor
          </button>
        ))}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default TwoFactorResetCard
