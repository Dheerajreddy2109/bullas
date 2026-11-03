import { useState } from 'react'
import { generatePassword } from '../utils/generatePassword.js'
import styles from '../css/OwnerResetForm.module.css'

// resetPassword is passed in, so the same form resets owners and builders.
function OwnerResetForm({ resetPassword, onReset }) {
  const [password, setPassword] = useState('')
  const [shownPassword, setShownPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const owner = await resetPassword(password)
      // Shown once from the form's own copy; the server never sends a password back.
      setShownPassword(password)
      setPassword('')
      onReset(owner)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Reset password</h2>
      <p className={styles.hint}>
        They are logged out everywhere and must choose their own password at next login.
      </p>
      <div className={styles.row}>
        <input
          className={styles.input}
          aria-label="Temporary password"
          autoComplete="new-password"
          required
          minLength={12}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className={styles.secondary} type="button" onClick={() => setPassword(generatePassword())}>
          Generate
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {shownPassword && (
        <p className={styles.notice} role="status">
          New temporary password: <code className={styles.code}>{shownPassword}</code>. Copy it now and send
          it to the owner privately; it won't be shown again.
        </p>
      )}
      <button className={styles.submit} type="submit" disabled={saving}>
        {saving ? 'Resetting...' : 'Reset password'}
      </button>
    </form>
  )
}

export default OwnerResetForm
