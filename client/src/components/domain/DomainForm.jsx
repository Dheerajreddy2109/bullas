import { useState } from 'react'
import styles from '../../css/domain/DomainForm.module.css'

function DomainForm({ currentDomain, busy, onSave, onRemove }) {
  const [domain, setDomain] = useState(currentDomain)
  // An in-page confirm rather than a browser pop-up, which can't be styled or tested easily.
  const [confirmRemove, setConfirmRemove] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    onSave(domain)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Custom domain
        <input
          className={styles.input}
          placeholder="dheeraj.com"
          autoCapitalize="none"
          spellCheck="false"
          required
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
        />
        <span className={styles.hint}>Enter the main domain. The www version is connected with it.</span>
      </label>
      <div className={styles.actions}>
        <button className={styles.primary} type="submit" disabled={busy}>
          Save domain
        </button>
        {currentDomain &&
          (confirmRemove ? (
            <>
              <span>Remove {currentDomain}?</span>
              <button className={styles.danger} type="button" disabled={busy} onClick={onRemove}>
                Yes, remove
              </button>
              <button className={styles.secondary} type="button" onClick={() => setConfirmRemove(false)}>
                No
              </button>
            </>
          ) : (
            <button className={styles.secondary} type="button" onClick={() => setConfirmRemove(true)}>
              Remove domain
            </button>
          ))}
      </div>
    </form>
  )
}

export default DomainForm
