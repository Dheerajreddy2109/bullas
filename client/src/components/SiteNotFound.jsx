import styles from '../css/SiteNotFound.module.css'

// One message for unknown and unpublished sites alike, so drafts can't be discovered.
function SiteNotFound({ title = 'Site not found', message = 'There is no published website at this address.' }) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>
      </div>
    </main>
  )
}

export default SiteNotFound
