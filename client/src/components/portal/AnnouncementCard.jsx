import SmartImage from '../sections/SmartImage.jsx'
import { telHref } from '../../templates/contentHelpers.js'
import { categoryInfo } from './announcementCategories.js'
import styles from '../../css/portal/AnnouncementCard.module.css'

// One announcement. Each category has its own colours; birthdays and weddings use a round photo,
// because they show people, while business and job notices use a wide picture.
function AnnouncementCard({ item }) {
  const category = categoryInfo(item.category)
  const isPeople = category.value === 'birthday' || category.value === 'wedding'

  return (
    <article className={`${styles.card} ${styles[category.value]}`}>
      <span className={styles.badge}>
        <span aria-hidden="true">{category.icon}</span> {category.label}
      </span>
      <SmartImage
        className={isPeople ? styles.roundPhoto : styles.widePhoto}
        src={item.image}
        alt=""
        round={isPeople}
      />
      <h3 className={styles.title}>{item.title}</h3>
      {item.date && <p className={styles.date}>📅 {item.date}</p>}
      {item.details && <p className={styles.details}>{item.details}</p>}
      {item.phone && (
        <a className={styles.phone} href={telHref(item.phone)}>
          📞 {item.phone}
        </a>
      )}
    </article>
  )
}

export default AnnouncementCard
