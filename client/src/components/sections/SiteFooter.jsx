import { safeHref } from '../../templates/contentHelpers.js'
import styles from '../../css/sections/SiteFooter.module.css'

function SiteFooter({ title, text, menu = [] }) {
  return (
    <footer className={styles.footer}>
      <div>
        <p className={styles.title}>{title}</p>
        {text && <p className={styles.text}>{text}</p>}
      </div>
      <nav className={styles.menu} aria-label="Footer menu">
        {menu.map((item, index) => (
          <a key={index} className={styles.link} href={safeHref(item.href)}>
            {item.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}

export default SiteFooter
