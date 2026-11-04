import { useState } from 'react'
import { FaLocationDot } from 'react-icons/fa6'
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
            <FaLocationDot className={styles.pin} aria-hidden="true" />
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
