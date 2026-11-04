import { FaLocationDot, FaRegCalendarDays, FaRegClock } from 'react-icons/fa6'
import SmartImage from '../sections/SmartImage.jsx'
import styles from '../../css/portal/EventCard.module.css'

const ICONS = { date: FaRegCalendarDays, time: FaRegClock, place: FaLocationDot }

function Detail({ icon, children }) {
  if (!children) return null
  const Icon = ICONS[icon]
  return (
    <li className={styles.detail}>
      <Icon className={`${styles.icon} ${styles[icon]}`} aria-hidden="true" />
      <span>{children}</span>
    </li>
  )
}

// One event: a coloured title strip, a picture, then date, time and place.
// colourIndex picks one of the theme's six colours, so neighbouring cards look different.
function EventCard({ event, colourIndex = 0 }) {
  return (
    <article className={styles.card} style={{ '--event-colour': `var(--pill-${(colourIndex % 6) + 1}, var(--brand))` }}>
      <h3 className={styles.title}>
        <span className={styles.titleText}>{event.title}</span>
      </h3>
      <SmartImage className={styles.image} src={event.image} alt="" />
      <ul className={styles.details}>
        <Detail icon="date">{event.date}</Detail>
        <Detail icon="time">{event.time}</Detail>
        <Detail icon="place">{event.place}</Detail>
      </ul>
    </article>
  )
}

export default EventCard
