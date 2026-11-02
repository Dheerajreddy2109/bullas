import { useEffect, useState } from 'react'
import TemplateCard from '../components/TemplateCard.jsx'
import { getTemplates } from '../services/api.js'
import styles from '../css/TemplatesPage.module.css'

function TemplatesPage() {
  const [templates, setTemplates] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <h1 className={styles.title}>Templates</h1>
      {error && <p role="alert">Could not load templates: {error}</p>}
      {!error && !templates && <p>Loading...</p>}
      {templates && (
        <div className={styles.grid}>
          {templates.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>
      )}
    </>
  )
}

export default TemplatesPage
