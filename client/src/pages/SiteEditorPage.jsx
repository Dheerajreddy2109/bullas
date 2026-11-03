import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ContentEditor from '../components/editor/ContentEditor.jsx'
import { getSiteContent, saveSiteContent } from '../services/api.js'
import { templateLayouts } from '../templates/registry.js'
import styles from '../css/SiteEditorPage.module.css'

function SiteEditorPage() {
  const { id } = useParams()
  const [site, setSite] = useState(null)
  const [content, setContent] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSiteContent(id)
      .then((data) => {
        setSite(data)
        setContent(data.content)
      })
      .catch((err) => setLoadError(err.message))
  }, [id])

  function handleChange(nextContent) {
    setContent(nextContent)
    setDirty(true)
    setSaved(false)
    setSaveError('')
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const result = await saveSiteContent(id, content)
      // Uses the server's copy, so the form shows exactly what was stored.
      setContent(result.content)
      setDirty(false)
      setSaved(true)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loadError) return <p role="alert">Could not load this site: {loadError}</p>
  if (!content) return <p>Loading...</p>

  const Layout = templateLayouts[site.templateSlug]

  return (
    <>
      <div className={styles.header}>
        <div>
          <Link className={styles.back} to="/sites">
            Back to sites
          </Link>
          <h1 className={styles.title}>Edit {site.name}</h1>
        </div>
        <div className={styles.saveArea}>
          {dirty && <span className={styles.unsaved}>Unsaved changes</span>}
          {saved && <span className={styles.saved}>Saved</span>}
          {/* Hidden while there are unsaved edits, because the preview shows saved content only. */}
          {!dirty && (
            <Link className={styles.previewLink} to={`/sites/${id}/preview`}>
              Preview site
            </Link>
          )}
          <button className={styles.save} type="button" disabled={saving || !dirty} onClick={handleSave}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {saveError && (
        <p className={styles.error} role="alert">
          {saveError}
        </p>
      )}
      <div className={styles.columns}>
        <ContentEditor content={content} siteId={id} onChange={handleChange} />
        <section className={styles.preview} aria-label="Live preview">
          {Layout ? <Layout content={content} /> : <p>No preview exists for this template yet.</p>}
        </section>
      </div>
    </>
  )
}

export default SiteEditorPage
