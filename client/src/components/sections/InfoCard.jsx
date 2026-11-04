import SmartImage from './SmartImage.jsx'
import { telHref } from '../../templates/contentHelpers.js'
import styles from '../../css/sections/InfoCard.module.css'

// The one card used for members, schemes, notices, products and projects.
// variant: 'default' (photo on top), 'person' (round photo, centred) or 'tile' (small square icon).
// Every card in a row is the same height, and long text is cut off neatly instead of pushing it taller.
function InfoCard({ image, title, overline, lines = [], phone, variant = 'default', photoLabel }) {
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.media}>
        <SmartImage src={image} alt={title} placeholder={variant === 'tile' ? '' : photoLabel} round={variant === 'person'} />
      </div>
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
            <span aria-hidden="true">📞</span> {phone}
          </a>
        )}
      </div>
    </article>
  )
}

export default InfoCard
