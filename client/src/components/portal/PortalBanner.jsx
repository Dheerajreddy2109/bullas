import { FaLocationDot } from 'react-icons/fa6'
import Container from '../sections/Container.jsx'
import SiteNav from '../sections/SiteNav.jsx'
import SmartImage from '../sections/SmartImage.jsx'
import { useLanguage } from '../../hooks/useLanguage.js'
import styles from '../../css/portal/PortalBanner.module.css'

function LeaderCard({ leader, side }) {
  return (
    <figure className={`${styles.leader} ${styles[side]}`}>
      <SmartImage className={styles.leaderPhoto} src={leader.photo} alt={leader.name || 'Leader photo'} person />
      <figcaption className={styles.leaderText}>
        {leader.name && <strong className={styles.leaderName}>{leader.name}</strong>}
        {leader.title && <span className={styles.leaderTitle}>{leader.title}</span>}
      </figcaption>
    </figure>
  )
}

// The big village banner: a leader on each side, the village name in the middle, and the
// sticky menu underneath. Every page of a site uses it unchanged, so the header never changes.
// The menu sits beside the banner, not inside it, so it stays pinned after the banner scrolls away.
function PortalBanner({ village = {}, logo, menu = [] }) {
  const { labels } = useLanguage()
  // Only this site's own uploads pass the server's checks, so the address is safe in a style.
  const background = village.bannerImage ? { '--banner-photo': `url("${village.bannerImage}")` } : undefined
  const taglineParts = (village.tagline ?? '').split('|').map((part) => part.trim()).filter(Boolean)
  const leaders = [
    { photo: village.leftLeaderPhoto, name: village.leftLeaderName, title: village.leftLeaderTitle },
    { photo: village.rightLeaderPhoto, name: village.rightLeaderName, title: village.rightLeaderTitle },
  ]

  return (
    <>
      <header id="top" className={`${styles.banner} ${village.bannerImage ? styles.withPhoto : ''}`} style={background}>
        <Container className={styles.inner}>
          <LeaderCard leader={leaders[0]} side="left" />

          <div className={styles.centre}>
            <div className={styles.titleRow}>
              {logo && <img className={styles.logo} src={logo} alt="" />}
              <div>
                <h1 className={styles.name}>{village.name}</h1>
                {village.englishName && <p className={styles.englishName}>{village.englishName}</p>}
              </div>
              {/* Beside the name, not above a leader, so both leaders' photos stay level. */}
              {village.emblem && <img className={styles.emblem} src={village.emblem} alt="" />}
            </div>
            {village.subtitle && <p className={styles.subtitle}>{village.subtitle}</p>}
            {village.location && (
              <p className={styles.location}>
                <FaLocationDot aria-hidden="true" />
                {village.location}
              </p>
            )}
            {taglineParts.length > 0 && (
              <p className={styles.tagline}>
                {taglineParts.map((part, index) => (
                  <span key={index}>{part}</span>
                ))}
              </p>
            )}
          </div>

          <LeaderCard leader={leaders[1]} side="right" />
        </Container>
      </header>
      <div className={styles.navBar}>
        <Container>
          <SiteNav items={menu} look="pills" label={labels.menu} />
        </Container>
      </div>
    </>
  )
}

export default PortalBanner
