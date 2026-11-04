import Container from '../sections/Container.jsx'
import SiteNav from '../sections/SiteNav.jsx'
import SmartImage from '../sections/SmartImage.jsx'
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
// sticky menu underneath. compact (for blog pages) leaves out the leaders and tagline.
// The menu sits beside the banner, not inside it, so it stays pinned after the banner scrolls away.
function PortalBanner({ village = {}, logo, menu = [], menuLabel = 'మెనూ', compact = false }) {
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
        <Container className={`${styles.inner} ${compact ? styles.compact : ''}`}>
          {!compact && <LeaderCard leader={leaders[0]} side="left" />}

          <div className={styles.centre}>
            <div className={styles.titleRow}>
              {logo && <img className={styles.logo} src={logo} alt="" />}
              <div>
                <h1 className={styles.name}>{village.name}</h1>
                {village.englishName && <p className={styles.englishName}>{village.englishName}</p>}
              </div>
            </div>
            {village.subtitle && <p className={styles.subtitle}>{village.subtitle}</p>}
            {village.location && (
              <p className={styles.location}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
                </svg>
                {village.location}
              </p>
            )}
            {!compact && taglineParts.length > 0 && (
              <p className={styles.tagline}>
                {taglineParts.map((part, index) => (
                  <span key={index}>{part}</span>
                ))}
              </p>
            )}
          </div>

          {!compact && (
            <div className={styles.rightSide}>
              {village.emblem && <img className={styles.emblem} src={village.emblem} alt="" />}
              <LeaderCard leader={leaders[1]} side="right" />
            </div>
          )}
        </Container>
      </header>
      <div className={styles.navBar}>
        <Container>
          <SiteNav items={menu} look="pills" label={menuLabel} />
        </Container>
      </div>
    </>
  )
}

export default PortalBanner
