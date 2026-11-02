import { Link } from 'react-router-dom'
import styles from '../css/SiteCreatedNotice.module.css'

// The password only exists here because the form just held it; the server can't show it again.
function SiteCreatedNotice({ site, temporaryPassword }) {
  return (
    <div className={styles.notice} role="status">
      <h2 className={styles.title}>"{site.name}" was created</h2>
      <dl className={styles.details}>
        <dt>Subdomain</dt>
        <dd>{site.subdomain}</dd>
        <dt>Owner email</dt>
        <dd>{site.owner.email}</dd>
        <dt>Temporary password</dt>
        <dd className={styles.password}>{temporaryPassword}</dd>
      </dl>
      <p className={styles.warning}>
        Copy this password now, because it won't be shown again. Send it to the owner privately,
        separately from the email address.
      </p>
      <Link className={styles.button} to="/sites">
        Go to sites
      </Link>
    </div>
  )
}

export default SiteCreatedNotice
