import Container from './Container.jsx'
import { safeHref, telHref } from '../../templates/contentHelpers.js'
import styles from '../../css/sections/SiteFooter.module.css'

// Read once when the page loads, rather than on every render.
const YEAR = new Date().getFullYear()

// Three columns (about, links, contact) inside the same page column as every section.
function SiteFooter({ title, text, menu = [], contact = {} }) {
  const year = YEAR

  return (
    <footer className={styles.footer}>
      <Container className={styles.columns}>
        <div>
          <p className={styles.title}>{title}</p>
          {text && <p className={styles.text}>{text}</p>}
        </div>
        <nav aria-label="Footer menu">
          <ul className={styles.links}>
            {menu.map((item, index) => (
              <li key={index}>
                <a className={styles.link} href={safeHref(item.href)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.contact}>
          {contact.address && <p className={styles.text}>{contact.address}</p>}
          {contact.phone && (
            <a className={styles.link} href={telHref(contact.phone)}>
              {contact.phone}
            </a>
          )}
          {contact.email && (
            <a className={styles.link} href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          )}
        </div>
      </Container>
      <Container className={styles.bottom}>
        © {year} {title}
      </Container>
    </footer>
  )
}

export default SiteFooter
