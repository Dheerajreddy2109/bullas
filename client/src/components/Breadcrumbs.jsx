import { Link } from 'react-router-dom'
import styles from '../css/Breadcrumbs.module.css'

// The trail showing where you are, like  ⌂ › Sites › Dheeraj Village › Blog.
// Every item but the last is a link; the last is the current page.
// look: 'admin' (grey on light pages), 'light' (on dark bars) or 'site' (public pages, in the site's colour).
// The first item shows a home icon; homeLabel replaces it with words, for the public sites.
function Breadcrumbs({ items, look = 'admin', homeLabel }) {
  const trail = items.filter(Boolean)

  return (
    <nav className={`${styles.breadcrumbs} ${styles[look]}`} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1
          const isHome = index === 0 && !homeLabel
          const label = isHome ? (
            <>
              <svg className={styles.home} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z" />
              </svg>
              <span className={styles.srOnly}>{item.label}</span>
            </>
          ) : index === 0 ? (
            homeLabel
          ) : (
            item.label
          )

          return (
            <li key={index} className={styles.item}>
              {isLast || !item.to ? (
                <span className={styles.current} aria-current={isLast ? 'page' : undefined} title={item.label}>
                  {label}
                </span>
              ) : (
                <Link className={styles.link} to={item.to} title={item.label}>
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
