import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../services/api.js'
import { templateLayouts } from '../templates/registry.js'
import styles from '../css/SitePreviewPage.module.css'

// Shows the site's saved content, not unsaved edits, so it matches what visitors would get.
function SitePreviewPage() {
  const { id } = useParams()
  const [site, setSite] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getSiteContent(id)
      .then(setSite)
      .catch((err) => setError(err.message))
  }, [id])

  if (error) return <p role="alert">Could not load this site: {error}</p>
  if (!site) return <p>Loading...</p>

  const Layout = templateLayouts[site.templateSlug]

  return (
    <>
      <div className={styles.bar}>
        <Link className={styles.link} to="/sites">
          Back to sites
        </Link>
        <Link className={styles.link} to={`/sites/${id}/edit`}>
          Edit content
        </Link>
        <Link className={styles.link} to={`/sites/${id}/blog/preview`}>
          View blog
        </Link>
        <span>
          Preview: {site.name} ({site.status})
        </span>
      </div>
      {Layout ? <Layout content={site.content} /> : <p>No layout exists for this template yet.</p>}
    </>
  )
}

export default SitePreviewPage
