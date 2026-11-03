import { useState } from 'react'
import { uploadSiteImage } from '../../services/api.js'
import styles from '../../css/editor/ImageField.module.css'

const TWO_MEGABYTES = 2 * 1024 * 1024

function ImageField({ label, value, siteId, onChange }) {
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleFile(event) {
    const file = event.target.files[0]
    // Cleared so choosing the same file again after an error still triggers a change.
    event.target.value = ''
    if (!file) return

    setError('')
    // Saves a slow upload that would be refused; the server still makes the real check.
    if (file.size > TWO_MEGABYTES) {
      setError('Image must be 2 MB or smaller')
      return
    }

    setUploading(true)
    try {
      const { url } = await uploadSiteImage(siteId, file)
      onChange(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.field}>
      <span className={styles.title}>{label}</span>
      {value && <img className={styles.thumbnail} src={value} alt={label} />}
      <div className={styles.actions}>
        <label className={styles.button}>
          {uploading ? 'Uploading...' : value ? 'Change image' : 'Choose image'}
          <input
            className={styles.file}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
        {value && (
          <button className={styles.button} type="button" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      <span className={styles.hint}>JPG, PNG or WebP, up to 2 MB.</span>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default ImageField
