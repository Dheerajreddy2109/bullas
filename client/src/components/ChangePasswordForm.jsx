import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import PasswordInput from './PasswordInput.jsx'
import styles from '../css/ChangePasswordForm.module.css'

function ChangePasswordForm({ onChanged }) {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    // Checked here for quick feedback; the server applies its own rules too.
    if (newPassword !== repeat) return setError('The new passwords do not match')
    if (newPassword.length < 12) return setError('The new password must be at least 12 characters')

    setSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      onChanged()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Current password
        <PasswordInput
          className={styles.input}
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </label>
      <label className={styles.label}>
        New password (at least 12 characters)
        <PasswordInput
          className={styles.input}
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </label>
      <label className={styles.label}>
        Repeat new password
        <PasswordInput
          className={styles.input}
          autoComplete="new-password"
          required
          value={repeat}
          onChange={(event) => setRepeat(event.target.value)}
        />
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button className={styles.button} type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Change password'}
      </button>
    </form>
  )
}

export default ChangePasswordForm
