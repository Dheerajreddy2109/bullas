import { useState } from 'react'
import Container from '../sections/Container.jsx'
import SocialIcons from './SocialIcons.jsx'
import styles from '../../css/portal/PortalTopBar.module.css'

const DATE_FORMAT = new Intl.DateTimeFormat('te-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// The thin strip at the very top: State › District › Mandal › Village, today's date and social links.
function PortalTopBar({ state, district, mandal, village, social }) {
  // Read once when the page opens, so the date doesn't change while someone is reading.
  const [today] = useState(() => DATE_FORMAT.format(new Date()))
  const places = [state, district, mandal, village].filter(Boolean)

  return (
    <div className={styles.bar}>
      <Container className={styles.inner}>
        {places.length > 0 && (
          <p className={styles.places}>
            <svg className={styles.pin} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
            </svg>
            {places.map((place, index) => (
              <span key={index} className={styles.place}>
                {place}
              </span>
            ))}
          </p>
        )}
        <div className={styles.right}>
          <span className={styles.date}>{today}</span>
          <SocialIcons links={social} />
        </div>
      </Container>
    </div>
  )
}

export default PortalTopBar
