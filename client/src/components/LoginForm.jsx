import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import PasswordInput from './PasswordInput.jsx'
import TwoFactorCodeForm from './twofactor/TwoFactorCodeForm.jsx'
import styles from '../css/LoginForm.module.css'

function LoginForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Becomes true after a correct password when the account uses two-factor login.
  const [needsCode, setNeedsCode] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if ((await signIn(email, password)) === 'code') {
        setNeedsCode(true)
        setPassword('')
        setSubmitting(false)
      }
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (needsCode) return <TwoFactorCodeForm onBack={() => setNeedsCode(false)} />

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Email
        <input
          className={styles.input}
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
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
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button className={styles.button} type="submit" disabled={submitting}>
        {submitting ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}

export default LoginForm
