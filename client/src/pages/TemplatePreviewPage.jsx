import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { getTemplate } from '../services/api.js'
import { templateLayouts } from '../templates/registry.js'
import styles from '../css/TemplatePreviewPage.module.css'

function TemplatePreviewPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [template, setTemplate] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getTemplate(slug)
      .then(setTemplate)
      .catch((err) => setError(err.message))
  }, [slug])

  if (error) return <p role="alert">Could not load this template: {error}</p>
  if (!template) return <p>Loading...</p>

  const Layout = templateLayouts[template.slug]
  if (!Layout) return <p role="alert">No layout exists yet for "{template.slug}".</p>

  return (
    <>
      {!searchParams.has('thumbnail') && (
        <div className={styles.bar}>
          <Breadcrumbs
            look="light"
            items={[
              { label: 'Dashboard', to: '/' },
              { label: 'Templates', to: '/templates' },
              { label: template.name },
            ]}
          />
          <span className={styles.actions}>Sample content</span>
        </div>
      )}
      <Layout content={template.defaultContent} />
    </>
  )
}

export default TemplatePreviewPage
