import { useState } from 'react'
import { updateSiteLanguage } from '../../services/api.js'
import { LANGUAGES } from '../../templates/labels.js'
import styles from '../../css/editor/SiteLanguageField.module.css'

// The language the owner types in. Visitors choosing it see the owner's own words;
// every other language is translated from them.
function SiteLanguageField({ siteId, value, onChange }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function choose(next) {
    setSaving(true)
    setError('')
    try {
      const result = await updateSiteLanguage(siteId, next)
      onChange(result.language)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>
        I write this website in
        <select className={styles.select} value={value} disabled={saving} onChange={(event) => choose(event.target.value)}>
          {LANGUAGES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <p className={styles.hint}>
        Visitors choose from 6 languages. Text is translated automatically after you save or publish. Names of people and
        villages stay as you wrote them.
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default SiteLanguageField
