import { useState } from 'react'
import { enableTwoFactor, setupTwoFactor } from '../../services/api.js'
import styles from '../../css/twofactor/TwoFactorSetup.module.css'

function TwoFactorSetup({ onEnabled }) {
  const [setup, setSetup] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function start() {
    setError('')
    setBusy(true)
    try {
      setSetup(await setupTwoFactor())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function confirm(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      onEnabled(await enableTwoFactor(code))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (!setup) {
    return (
      <div className={styles.box}>
        <p className={styles.text}>
          You'll need an authenticator app on your phone, such as Google Authenticator or Microsoft Authenticator.
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.primary} type="button" disabled={busy} onClick={start}>
          {busy ? 'Starting...' : 'Set up two-factor login'}
        </button>
      </div>
    )
  }

  return (
    <form className={styles.box} onSubmit={confirm}>
      <ol className={styles.steps}>
        <li>In your authenticator app, add an account and scan this QR code.</li>
      </ol>
      <img className={styles.qr} src={setup.qrDataUrl} alt="QR code for your authenticator app" />
      <p className={styles.small}>
        Can't scan it? Enter this key instead: <code className={styles.key}>{setup.manualKey}</code>
      </p>
      <ol className={styles.steps} start={2}>
        <li>Enter the 6-digit code the app shows.</li>
      </ol>
      <input
        className={styles.input}
        aria-label="6-digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button className={styles.primary} type="submit" disabled={busy}>
        {busy ? 'Checking...' : 'Turn on two-factor login'}
      </button>
    </form>
  )
}

export default TwoFactorSetup
