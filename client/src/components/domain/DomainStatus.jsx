import styles from '../../css/domain/DomainStatus.module.css'

const LABELS = {
  none: 'No custom domain',
  pending: 'Waiting for DNS',
  connected: 'Connected',
  failed: 'Not connected yet',
}

function DomainStatus({ domain, status, message, checkedAt, busy, onVerify }) {
  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <span className={`${styles.badge} ${styles[status]}`}>{LABELS[status] ?? status}</span>
        {domain && (
          <button className={styles.verify} type="button" disabled={busy} onClick={onVerify}>
            {busy ? 'Checking...' : 'Verify DNS'}
          </button>
        )}
      </div>
      {message && <p className={styles.message}>{message}</p>}
      {checkedAt && <p className={styles.time}>Last checked {new Date(checkedAt).toLocaleString()}</p>}
      {status === 'connected' && (
        <p className={styles.message}>
          https://{domain} and https://www.{domain} will get a free certificate automatically on their first visit.
        </p>
      )}
    </div>
  )
}

export default DomainStatus
