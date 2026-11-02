import SmartImage from './SmartImage.jsx'
import { telHref } from '../../templates/contentHelpers.js'
import styles from '../../css/sections/InfoCard.module.css'

// The one card used for members, schemes, notices, products and projects.
function InfoCard({ image, title, overline, lines = [], phone, compact = false, photoLabel }) {
  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <SmartImage className={styles.image} src={image} alt={title} placeholder={photoLabel} />
      <div className={styles.body}>
        {overline && <p className={styles.overline}>{overline}</p>}
        <h3 className={styles.title}>{title}</h3>
        {lines.filter(Boolean).map((line, index) => (
          <p key={index} className={styles.line}>
            {line}
          </p>
        ))}
        {phone && (
          <a className={styles.phone} href={telHref(phone)}>
            {phone}
          </a>
        )}
      </div>
    </article>
  )
}

export default InfoCard
