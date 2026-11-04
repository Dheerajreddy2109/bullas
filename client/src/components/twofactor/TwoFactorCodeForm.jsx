import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import styles from '../../css/twofactor/TwoFactorCodeForm.module.css'

// The second login step, shown after a correct password when 2FA is on.
function TwoFactorCodeForm({ onBack }) {
  const { verifyCode } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await verifyCode(code)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.text}>Open your authenticator app and enter the 6-digit code for Bullas. A code stops working when its timer ends, so if it's about to change, wait for the next one.</p>
      <label className={styles.label}>
        Code
        <input
          className={styles.input}
          // one-time-code lets phones offer the code automatically where supported.
          autoComplete="one-time-code"
          inputMode="text"
          autoFocus
          required
          maxLength={12}
          value={code}
          onChange={(event) => setCode(event.target.value.trim())}
        />
        <span className={styles.hint}>Lost your phone? Enter one of your backup codes instead.</span>
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button className={styles.button} type="submit" disabled={submitting}>
        {submitting ? 'Checking...' : 'Verify'}
      </button>
      <button className={styles.back} type="button" onClick={onBack}>
        Back to password
      </button>
    </form>
  )
}

export default TwoFactorCodeForm
