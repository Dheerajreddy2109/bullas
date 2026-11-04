import { useState } from 'react'
import { safeHref } from '../../templates/contentHelpers.js'
import styles from '../../css/sections/SiteNav.module.css'

// The site's menu. On phones it collapses behind a ☰ button instead of wrapping onto many lines.
// look: 'pills' (coloured buttons), 'bar' (on a coloured strip) or 'plain' (quiet text links).
function SiteNav({ items = [], look = 'pills', label = 'Menu' }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className={`${styles.nav} ${styles[look]}`} aria-label="Main menu">
      <button
        className={styles.toggle}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span> {label}
      </button>
      <ul className={`${styles.list} ${open ? styles.open : ''}`}>
        {items.map((item, index) => (
          <li key={index}>
            {/* Closes the phone menu after a tap, so the chosen section is visible. */}
            <a className={styles.link} href={safeHref(item.href)} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default SiteNav
