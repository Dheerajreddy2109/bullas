import { useState } from 'react'
import { createUser } from '../../services/api.js'
import { generatePassword } from '../../utils/generatePassword.js'
import styles from '../../css/users/CreateUserForm.module.css'

function CreateUserForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', temporaryPassword: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const user = await createUser(form)
      onCreated({ user, temporaryPassword: form.temporaryPassword })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Name
        <input className={styles.input} required value={form.name} onChange={(e) => update('name', e.target.value)} />
      </label>
      <label className={styles.label}>
        Email
        <input
          className={styles.input}
          type="email"
          required
          autoComplete="off"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
        />
      </label>
      <label className={styles.label}>
        Temporary password
        <span className={styles.row}>
          <input
            className={styles.input}
            required
            minLength={12}
            autoComplete="new-password"
            value={form.temporaryPassword}
            onChange={(e) => update('temporaryPassword', e.target.value)}
          />
          <button className={styles.secondary} type="button" onClick={() => update('temporaryPassword', generatePassword())}>
            Generate
          </button>
        </span>
        <span className={styles.hint}>They must change this at first login.</span>
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button className={styles.submit} type="submit" disabled={saving}>
        {saving ? 'Creating...' : 'Create builder'}
      </button>
    </form>
  )
}

export default CreateUserForm
