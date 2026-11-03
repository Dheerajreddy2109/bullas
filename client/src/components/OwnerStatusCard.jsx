import { useState } from 'react'
import { setOwnerDisabled } from '../services/api.js'
import styles from '../css/OwnerStatusCard.module.css'

function OwnerStatusCard({ siteId, owner, onChange }) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function toggle() {
    setError('')
    setSaving(true)
    try {
      onChange(await setOwnerDisabled(siteId, !owner.disabled))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Owner</h2>
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
        {owner.disabled ? 'Enable owner' : 'Disable owner'}
      </button>
      {!owner.disabled && (
        <p className={styles.hint}>Disabling logs the owner out at once. Their website stays online.</p>
      )}
    </div>
  )
}

export default OwnerStatusCard
