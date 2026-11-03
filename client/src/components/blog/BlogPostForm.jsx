import { useState } from 'react'
import ImageField from '../editor/ImageField.jsx'
import RichTextEditor from './RichTextEditor.jsx'
import { createBlogPost, updateBlogPost } from '../../services/api.js'
import styles from '../../css/blog/BlogPostForm.module.css'

function BlogPostForm({ siteId, post, onSaved }) {
  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    description: post?.description ?? '',
    image: post?.image ?? '',
    body: post?.body ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  // Old links to a published post stop working when its slug changes, so say so.
  const slugWarning = post?.status === 'published' && form.slug !== post.slug

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const saved = post
        ? await updateBlogPost(siteId, post._id, form)
        : await createBlogPost(siteId, form)
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Title
        <input
          className={styles.input}
          required
          maxLength={200}
          value={form.title}
          onChange={(event) => update('title', event.target.value)}
        />
      </label>

      <label className={styles.label}>
        Slug (the post's web address)
        <input
          className={styles.input}
          maxLength={80}
          placeholder={post ? '' : 'Leave empty to make one from the title'}
          value={form.slug}
          onChange={(event) => update('slug', event.target.value)}
        />
        {slugWarning && (
          <span className={styles.warning}>Changing this breaks any links people have already shared.</span>
        )}
      </label>

      <label className={styles.label}>
        Description
        <textarea
          className={styles.input}
          rows={2}
          maxLength={500}
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
        />
      </label>

      <ImageField label="Image" value={form.image} siteId={siteId} onChange={(value) => update('image', value)} />

      <div className={styles.label}>
        Body
        <RichTextEditor
          initialHtml={post?.body}
          resetKey={post?.updatedAt ?? 'new'}
          onChange={(value) => update('body', value)}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button className={styles.submit} type="submit" disabled={saving}>
        {saving ? 'Saving...' : post ? 'Save changes' : 'Create post'}
      </button>
    </form>
  )
}

export default BlogPostForm
