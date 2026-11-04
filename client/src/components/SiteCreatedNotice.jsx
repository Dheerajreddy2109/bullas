import { Link } from 'react-router-dom'
import { siteAddress } from '../utils/siteAddress.js'
import styles from '../css/SiteCreatedNotice.module.css'

// The password only exists here because the form just held it; the server can't show it again.
function SiteCreatedNotice({ site, temporaryPassword }) {
  const websiteUrl = siteAddress(site.subdomain)
  const adminUrl = siteAddress(site.subdomain, '/admin')

  return (
    <div className={styles.notice} role="status">
      <h2 className={styles.title}>"{site.name}" was created</h2>
      <dl className={styles.details}>
        <dt>Website</dt>
        <dd>
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
            {websiteUrl}
          </a>
          <span className={styles.hint}> (shows "Site not found" until you publish it)</span>
        </dd>
        <dt>Owner login</dt>
        <dd>
          <a href={adminUrl} target="_blank" rel="noopener noreferrer">
            {adminUrl}
          </a>
        </dd>
        <dt>Owner email</dt>
        <dd>{site.owner.email}</dd>
        <dt>Temporary password</dt>
        <dd className={styles.password}>{temporaryPassword}</dd>
      </dl>
      <p className={styles.warning}>
        Copy this password now, because it won't be shown again. Send the owner login address, email and password
        privately, with the password in a separate message.
      </p>
      <Link className={styles.button} to="/sites">
        Go to sites
      </Link>
    </div>
  )
}

export default SiteCreatedNotice
