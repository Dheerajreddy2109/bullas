import { useState } from 'react'
import PasswordInput from '../PasswordInput.jsx'
import { disableTwoFactor } from '../../services/api.js'
import styles from '../../css/twofactor/TwoFactorDisableForm.module.css'

// Needs both the password and a code, so a browser left logged in can't switch it off.
function TwoFactorDisableForm({ onDisabled }) {
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      onDisabled(await disableTwoFactor(password, code))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Turn off two-factor login</h2>
      <label className={styles.label}>
        Password
        <PasswordInput
          className={styles.input}
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className={styles.label}>
        Code from your app, or a backup code
        <input
          className={styles.input}
          autoComplete="one-time-code"
          required
          maxLength={12}
          value={code}
          onChange={(event) => setCode(event.target.value.trim())}
        />
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button className={styles.danger} type="submit" disabled={busy}>
        {busy ? 'Turning off...' : 'Turn off'}
      </button>
    </form>
  )
}

export default TwoFactorDisableForm
