import { useEffect, useRef, useState } from 'react'
import { getSiteTemplates, switchSiteTemplate } from '../../services/api.js'
import styles from '../../css/editor/TemplatePicker.module.css'

// Choose a new template, see the site's own content in it, then confirm.
// renderPreview(templateSlug, content) draws a layout, the same way the editor's live preview does.
function TemplatePicker({ siteId, currentSlug, renderPreview, onSwitched, onCancel }) {
  const [templates, setTemplates] = useState(null)
  const [chosen, setChosen] = useState('')
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Clicking quickly between templates starts several previews; only the latest may be shown.
  const latestRequest = useRef('')

  useEffect(() => {
    getSiteTemplates(siteId)
      .then((data) => setTemplates(data.templates))
      .catch((err) => setError(err.message))
  }, [siteId])

  async function choose(slug) {
    setChosen(slug)
    setPreview(null)
    setError('')
    latestRequest.current = slug
    try {
      // A dry run: the server works out the result but saves nothing.
      const result = await switchSiteTemplate(siteId, slug, { dryRun: true })
      if (latestRequest.current === slug) setPreview(result)
    } catch (err) {
      if (latestRequest.current === slug) setError(err.message)
    }
  }

  async function confirm() {
    setBusy(true)
    setError('')
    try {
      onSwitched(await switchSiteTemplate(siteId, chosen))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <section className={styles.picker} aria-label="Change template">
      <div className={styles.top}>
        <div>
          <h2 className={styles.heading}>Change template</h2>
          <p className={styles.hint}>
            Pick a design. All templates have the same sections, so your content moves across as it is.
          </p>
        </div>
        <button className={styles.cancel} type="button" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>

      {!templates && !error && <p>Loading templates...</p>}
      {templates && (
        <div className={styles.choices}>
          {templates.map((template) => {
            const isCurrent = template.slug === currentSlug
            return (
              <button
                key={template.slug}
                type="button"
                className={`${styles.choice} ${chosen === template.slug ? styles.chosen : ''}`}
                disabled={isCurrent || busy}
                aria-pressed={chosen === template.slug}
                onClick={() => choose(template.slug)}
              >
                <span className={styles.choiceName}>{template.name}</span>
                {template.description && <span className={styles.choiceText}>{template.description}</span>}
                {isCurrent && <span className={styles.badge}>Current</span>}
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {chosen && !preview && !error && <p>Preparing a preview with your content...</p>}
      {preview && (
        <>
          <div className={styles.summary}>
            <div>
              <h3 className={styles.listTitle}>Moves across</h3>
              {preview.moved.length ? (
                <ul className={styles.list}>
                  {preview.moved.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.none}>Nothing you've changed has a place here yet.</p>
              )}
            </div>
            <div>
              <h3 className={styles.listTitle}>Kept safely, not shown in this design</h3>
              {preview.keptAside.length ? (
                <ul className={styles.list}>
                  {preview.keptAside.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.none}>Nothing. Everything fits.</p>
              )}
            </div>
            <button className={styles.confirm} type="button" disabled={busy} onClick={confirm}>
              {busy ? 'Switching...' : `Switch to ${preview.templateName}`}
            </button>
          </div>
          <div className={styles.preview} aria-label={`Preview of ${preview.templateName}`}>
            {renderPreview(preview.templateSlug, preview.content)}
          </div>
        </>
      )}
    </section>
  )
}

export default TemplatePicker
