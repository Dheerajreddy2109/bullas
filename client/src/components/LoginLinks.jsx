import { useState } from 'react'
import styles from '../css/LoginLinks.module.css'

// The addresses someone needs, with a Copy button so they can be sent without typing mistakes.
function LoginLinks({ links }) {
  const [copied, setCopied] = useState('')

  async function copy(url) {
    await navigator.clipboard.writeText(url)
    setCopied(url)
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Addresses</h2>
      <dl className={styles.list}>
        {links.map(({ label, url }) => (
          <div key={label} className={styles.row}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
              <button className={styles.copy} type="button" onClick={() => copy(url)}>
                {copied === url ? 'Copied' : 'Copy'}
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default LoginLinks
