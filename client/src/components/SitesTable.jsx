import { Link } from 'react-router-dom'
import styles from '../css/SitesTable.module.css'

const formatDate = (value) => new Date(value).toLocaleDateString()

function SitesTable({ sites, busyId, onToggleStatus }) {
  return (
    // Scrolls inside its own box, so a wide table can't push a phone screen sideways.
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Subdomain</th>
            <th>Template</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site._id}>
              <td>{site.name}</td>
              <td>{site.subdomain}</td>
              <td>{site.templateId?.name ?? 'Unknown'}</td>
              <td>
                {site.ownerId ? (
                  <>
                    {site.ownerId.email}
                    {site.ownerId.disabled && <span className={styles.ownerDisabled}> (disabled)</span>}
                  </>
                ) : (
                  'None'
                )}
              </td>
              <td>
                <span className={`${styles.status} ${styles[site.status]}`}>{site.status}</span>
              </td>
              <td>{formatDate(site.createdAt)}</td>
              <td className={styles.actions}>
                <Link className={styles.button} to={`/sites/${site._id}/edit`}>
                  Edit
                </Link>
                <Link className={styles.button} to={`/sites/${site._id}/blog`}>
                  Blog
                </Link>
                <Link className={styles.button} to={`/sites/${site._id}/preview`}>
                  Preview
                </Link>
                {site.ownerId && (
                  <Link className={styles.button} to={`/sites/${site._id}/owner`}>
                    Owner
                  </Link>
                )}
                <button
                  className={styles.button}
                  type="button"
                  disabled={busyId === site._id}
                  onClick={() => onToggleStatus(site)}
                >
                  {site.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SitesTable
