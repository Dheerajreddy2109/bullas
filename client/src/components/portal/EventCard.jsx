import SmartImage from '../sections/SmartImage.jsx'
import styles from '../../css/portal/EventCard.module.css'

const ICONS = {
  date: 'M7 2v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zM5 9h14v11H5V9z',
  time: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v5.4l4 2.4-1 1.6-5-3V7h2z',
  place: 'M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z',
}

function Detail({ icon, children }) {
  if (!children) return null
  return (
    <li className={styles.detail}>
      <svg className={`${styles.icon} ${styles[icon]}`} viewBox="0 0 24 24" aria-hidden="true">
        <path d={ICONS[icon]} />
      </svg>
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
