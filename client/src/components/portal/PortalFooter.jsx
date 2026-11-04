import Container from '../sections/Container.jsx'
import { safeHref } from '../../templates/contentHelpers.js'
import SocialIcons from './SocialIcons.jsx'
import styles from '../../css/portal/PortalFooter.module.css'

// Worked out once when the page loads, rather than on every draw.
const YEAR = new Date().getFullYear()
// The template's sample footer title. Until the owner changes it, the real village name is shown.
const SAMPLE_TITLE = 'మీ గ్రామం పేరు'

// The dark bar at the very bottom: logo and name, menu links, and social icons.
function PortalFooter({ villageName, footer = {}, logo, menu = [], social = [] }) {
  const title = footer.text && footer.text !== SAMPLE_TITLE ? footer.text : villageName
  const hasSocial = social.some((link) => link.href)

  return (
    <footer className={styles.footer}>
      <Container className={styles.columns}>
        <div className={styles.brand}>
          {logo && <img className={styles.logo} src={logo} alt="" />}
          <div>
            <p className={styles.title}>{title}</p>
            {footer.tagline && <p className={styles.tagline}>{footer.tagline}</p>}
          </div>
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
        {hasSocial && (
          <div className={styles.follow}>
            <span className={styles.followLabel}>మమ్మల్ని అనుసరించండి</span>
            <SocialIcons links={social} size="large" />
          </div>
        )}
      </Container>
      <Container className={styles.bottom}>
        © {YEAR} {title}
      </Container>
    </footer>
  )
}

export default PortalFooter
