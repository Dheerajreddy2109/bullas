import SmartImage from './SmartImage.jsx'
import { safeHref } from '../../templates/contentHelpers.js'
import styles from '../../css/sections/SiteHeader.module.css'

// One header with three arrangements, so templates can look different without copied code.
function SiteHeader({ variant = 'banner', logo, title, subtitle, location, tagline, image, menu = [] }) {
  return (
    <header id="top" className={`${styles.header} ${styles[variant]}`}>
      <div className={styles.heroText}>
        {logo && <img className={styles.logo} src={logo} alt={`${title} logo`} />}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {location && <p className={styles.location}>{location}</p>}
        {tagline && <p className={styles.tagline}>{tagline}</p>}
      </div>
      {variant !== 'banner' && (
        <SmartImage className={styles.heroImage} src={image} alt={title} placeholder="Banner image" />
      )}
      <nav className={styles.menu} aria-label="Main menu">
        {menu.map((item, index) => (
          <a key={index} className={styles.menuLink} href={safeHref(item.href)}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

export default SiteHeader
