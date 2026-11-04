import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import LanguageScope from '../components/LanguageScope.jsx'
import { useLatestPosts } from '../hooks/useLatestPosts.js'
import { getSiteContent } from '../services/api.js'
import { templateLayouts } from '../templates/registry.js'
import styles from '../css/SitePreviewPage.module.css'

// Shows the site's saved content, not unsaved edits, so it matches what visitors would get.
function SitePreviewPage() {
  const { id } = useParams()
  const [site, setSite] = useState(null)
  const [error, setError] = useState('')
  const latestPosts = useLatestPosts(id)

  useEffect(() => {
    getSiteContent(id)
      .then(setSite)
      .catch((err) => setError(err.message))
  }, [id])

  if (error) return <p role="alert">Could not load this site: {error}</p>
  if (!site) return <p>Loading...</p>

  const Layout = templateLayouts[site.templateSlug]

  return (
    <LanguageScope language={site.language}>
      <div className={styles.bar}>
        <Breadcrumbs
          look="light"
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Sites', to: '/sites' },
            { label: site.name, to: `/sites/${id}/edit` },
            { label: 'Preview' },
          ]}
        />
        <div className={styles.actions}>
          <span className={styles.status}>{site.status}</span>
          <Link className={styles.link} to={`/sites/${id}/edit`}>
            Edit content
          </Link>
          <Link className={styles.link} to={`/sites/${id}/blog/preview`}>
            View blog
          </Link>
        </div>
      </div>
      {Layout ? (
        <Layout
          content={site.content}
          latestPosts={latestPosts}
          blogHref={`/sites/${id}/blog/preview`}
          postHref={(post) => `/sites/${id}/blog/preview/${post._id}`}
        />
      ) : <p>No layout exists for this template yet.</p>}
    </LanguageScope>
  )
}

export default SitePreviewPage
