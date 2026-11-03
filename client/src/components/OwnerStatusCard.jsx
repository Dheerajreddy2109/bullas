import { useState } from 'react'
import styles from '../css/OwnerStatusCard.module.css'

// setDisabled and the wording are passed in, so the same card serves owners and builders.
function OwnerStatusCard({ owner, setDisabled, onChange, title = 'Owner', subject = 'owner', note = 'Their website stays online.' }) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function toggle() {
    setError('')
    setSaving(true)
    try {
      onChange(await setDisabled(!owner.disabled))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <dl className={styles.details}>
        <dt>Name</dt>
        <dd>{owner.name}</dd>
        <dt>Email</dt>
        <dd>{owner.email}</dd>
        <dt>Status</dt>
        <dd>
          <span className={owner.disabled ? styles.disabled : styles.active}>
            {owner.disabled ? 'Disabled' : 'Active'}
          </span>
          {owner.mustChangePassword && <span className={styles.pending}> Temporary password not changed yet</span>}
        </dd>
      </dl>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button
        className={owner.disabled ? styles.enable : styles.disable}
        type="button"
        disabled={saving}
        onClick={toggle}
      >
        {owner.disabled ? `Enable ${subject}` : `Disable ${subject}`}
      </button>
      {!owner.disabled && (
        <p className={styles.hint}>Disabling logs them out at once. {note}</p>
      )}
    </div>
  )
}

export default OwnerStatusCard
