import { useEffect, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import ContentEditor from '../components/editor/ContentEditor.jsx'
import TemplatePicker from '../components/editor/TemplatePicker.jsx'
import ScopeLink from '../components/ScopeLink.jsx'
import { useLatestPosts } from '../hooks/useLatestPosts.js'
import { useSiteScope } from '../hooks/useSiteScope.js'
import { SITE_SAVED_EVENT } from '../hooks/useSiteBranding.js'
import { getSiteContent, saveSiteContent } from '../services/api.js'
import { templateLayouts } from '../templates/registry.js'
import styles from '../css/SiteEditorPage.module.css'

function SiteEditorPage() {
  const scope = useSiteScope()
  const id = scope.siteId
  const [site, setSite] = useState(null)
  const [content, setContent] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [picking, setPicking] = useState(false)
  const [switchedTo, setSwitchedTo] = useState('')
  const latestPosts = useLatestPosts(id)

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
    setSwitchedTo('')
    setSaveError('')
  }

  function handleSwitched(result) {
    setSite({ ...site, templateSlug: result.templateSlug })
    setContent(result.content)
    window.dispatchEvent(new CustomEvent(SITE_SAVED_EVENT, { detail: { siteId: id, content: result.content } }))
    setPicking(false)
    setSaved(false)
    setSwitchedTo(result.templateName)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const result = await saveSiteContent(id, content)
      // Uses the server's copy, so the form shows exactly what was stored.
      setContent(result.content)
      window.dispatchEvent(new CustomEvent(SITE_SAVED_EVENT, { detail: { siteId: id, content: result.content } }))
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

  // Used by both the live preview and the template picker, so they always look the same.
  function renderPreview(templateSlug, previewContent) {
    const Layout = templateLayouts[templateSlug]
    if (!Layout) return <p>No preview exists for this template yet.</p>
    return (
      <Layout
        content={previewContent}
        latestPosts={latestPosts}
        blogHref={scope.blogPreviewHref}
        // Owners' previews link to their real blog; the admin's link to the blog preview.
        postHref={(post) =>
          scope.previewIsExternal ? `/blog/${encodeURIComponent(post.slug)}` : `${scope.blogPreviewHref}/${post._id}`
        }
      />
    )
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          {/* The admin's trail ends at the site itself; an owner's adds the page name. */}
          <Breadcrumbs
            items={scope.needsSiteName ? scope.siteCrumbs(site.name) : [...scope.siteCrumbs(), { label: 'Edit website' }]}
          />
          <h1 className={styles.title}>Edit {site.name}</h1>
        </div>
        <div className={styles.saveArea}>
          {dirty && <span className={styles.unsaved}>Unsaved changes</span>}
          {saved && <span className={styles.saved}>Saved</span>}
          {switchedTo && <span className={styles.saved}>Now using {switchedTo}</span>}
          {/* Switching works from saved content, so unsaved edits must be saved first. */}
          {!picking && (
            <button
              className={styles.previewLink}
              type="button"
              disabled={dirty}
              title={dirty ? 'Save your changes first' : undefined}
              onClick={() => setPicking(true)}
            >
              Change template
            </button>
          )}
          {/* Hidden while there are unsaved edits, because the preview shows saved content only. */}
          {!dirty && (
            <ScopeLink className={styles.previewLink} to={scope.previewHref} external={scope.previewIsExternal}>
              Preview site
            </ScopeLink>
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
      {picking ? (
        <TemplatePicker
          siteId={id}
          currentSlug={site.templateSlug}
          renderPreview={renderPreview}
          onSwitched={handleSwitched}
          onCancel={() => setPicking(false)}
        />
      ) : (
        <div className={styles.columns}>
          {/* The key starts the form fresh, because a new template has different sections. */}
          <ContentEditor key={site.templateSlug} content={content} siteId={id} onChange={handleChange} />
          <section className={styles.preview} aria-label="Live preview">
            {renderPreview(site.templateSlug, content)}
          </section>
        </div>
      )}
    </>
  )
}

export default SiteEditorPage
