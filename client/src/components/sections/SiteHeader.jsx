import Container from './Container.jsx'
import SiteNav from './SiteNav.jsx'
import SmartImage from './SmartImage.jsx'
import { safeHref } from '../../templates/contentHelpers.js'
import styles from '../../css/sections/SiteHeader.module.css'

// One header with three arrangements, so templates can look different without copied code.
// banner: centred title with a sticky menu bar below (village portal).
// split: sticky menu strip on top, then text beside a large image (business, shop).
// minimal: sticky quiet menu, then large text beside a round portrait (portfolio).
//
// The menu bar is placed beside the header, not inside it: a sticky element only stays pinned
// while its parent is on screen, so inside the header it would scroll away with the header.
// actions are the big buttons under the headline, such as 'Contact us' (split and minimal only).
function SiteHeader({ variant = 'banner', logo, title, subtitle, location, tagline, image, menu = [], menuLabel, actions = [] }) {
  const nav = (
    <SiteNav items={menu} look={variant === 'banner' ? 'pills' : variant === 'split' ? 'bar' : 'plain'} label={menuLabel} />
  )

  if (variant === 'banner') {
    return (
      <>
        <header id="top" className={styles.bannerHero}>
          <Container className={styles.bannerInner}>
            {logo && <img className={styles.logo} src={logo} alt={`${title} logo`} />}
            <h1 className={styles.bannerTitle}>{title}</h1>
            {subtitle && <p className={styles.bannerSubtitle}>{subtitle}</p>}
            {location && <p className={styles.bannerLocation}>{location}</p>}
            {tagline && <p className={styles.bannerTagline}>{tagline}</p>}
          </Container>
        </header>
        <div className={styles.bannerNav}>
          <Container>{nav}</Container>
        </div>
      </>
    )
  }

  return (
    <>
      <div id="top" className={`${styles.topNav} ${styles[`${variant}Nav`]}`}>
        <Container className={styles.topNavInner}>
          <span className={styles.brand}>
            {logo ? <img className={styles.brandLogo} src={logo} alt={`${title} logo`} /> : title}
          </span>
          {nav}
        </Container>
      </div>
      <header className={styles[variant]}>
        <Container className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{title}</h1>
            {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
            {actions.length > 0 && (
              <div className={styles.actions}>
                {actions.map((action, index) => (
                  <a
                    key={action.href}
                    className={index === 0 ? styles.primaryAction : styles.secondaryAction}
                    href={safeHref(action.href)}
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className={styles.heroMedia}>
            <SmartImage src={image} alt={title} round={variant === 'minimal'} />
          </div>
        </Container>
      </header>
    </>
  )
}

export default SiteHeader
