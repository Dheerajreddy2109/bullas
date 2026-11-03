import { useEffect, useState } from 'react'
import { createSite, getTemplates } from '../services/api.js'
import { generatePassword } from '../utils/generatePassword.js'
import styles from '../css/CreateSiteForm.module.css'

const EMPTY_FORM = {
  name: '',
  templateSlug: '',
  subdomain: '',
  ownerName: '',
  ownerEmail: '',
  temporaryPassword: '',
}

// A quick check for friendly feedback only; the server always checks again.
function findProblem(form) {
  if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(form.subdomain)) {
    return 'Subdomain must be 3 to 30 lowercase letters, numbers or inner hyphens'
  }
  if (form.temporaryPassword.length < 12) {
    return 'Temporary password must be at least 12 characters'
  }
  return ''
}

function CreateSiteForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [templates, setTemplates] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch((err) => setError(`Could not load templates: ${err.message}`))
  }, [])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  async function handleSubmit(event) {
    event.preventDefault()
    const problem = findProblem(form)
    setError(problem)
    if (problem) return

    setSubmitting(true)
    try {
      const site = await createSite(form)
      onCreated({ site, temporaryPassword: form.temporaryPassword })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Site name
        <input
          className={styles.input}
          required
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
        />
      </label>

      <label className={styles.label}>
        Template
        <select
          className={styles.input}
          required
          value={form.templateSlug}
          onChange={(event) => update('templateSlug', event.target.value)}
        >
          <option value="">Choose a template</option>
          {templates.map((template) => (
            <option key={template.slug} value={template.slug}>
              {template.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        Subdomain
        <input
          className={styles.input}
          required
          autoCapitalize="none"
          value={form.subdomain}
          onChange={(event) => update('subdomain', event.target.value.toLowerCase())}
        />
        <span className={styles.hint}>3 to 30 lowercase letters, numbers or hyphens.</span>
      </label>

      <label className={styles.label}>
        Owner name
        <input
          className={styles.input}
          required
          value={form.ownerName}
          onChange={(event) => update('ownerName', event.target.value)}
        />
      </label>

      <label className={styles.label}>
        Owner email
        <input
          className={styles.input}
          type="email"
          required
          autoComplete="off"
          value={form.ownerEmail}
          onChange={(event) => update('ownerEmail', event.target.value)}
        />
      </label>

      <label className={styles.label}>
        Temporary password
        <span className={styles.passwordRow}>
          <input
            className={styles.input}
            required
            autoComplete="new-password"
            value={form.temporaryPassword}
            onChange={(event) => update('temporaryPassword', event.target.value)}
          />
          <button
            className={styles.secondary}
            type="button"
            onClick={() => update('temporaryPassword', generatePassword())}
          >
            Generate
          </button>
        </span>
        <span className={styles.hint}>The owner must change this at first login.</span>
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create site'}
      </button>
    </form>
  )
}

export default CreateSiteForm
