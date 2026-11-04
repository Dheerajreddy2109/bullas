import styles from '../../css/sections/SmartImage.module.css'

// New sites have empty image fields, so this keeps the page's shape until photos are added.
// round makes a circle, for people's photos. person shows a person icon in any shape.
function SmartImage({ src, alt, placeholder, round = false, person = round, className = '' }) {
  const shape = round ? styles.round : ''

  if (src) return <img className={`${styles.image} ${shape} ${className}`} src={src} alt={alt} loading="lazy" />

  return (
    <div className={`${styles.placeholder} ${shape} ${className}`} role="img" aria-label={alt}>
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        {person ? (
          <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4.5V20h14v-1.5C19 16 16 14 12 14z" />
        ) : (
          <path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm1 12h14l-4.5-6-3.5 4.5-2.5-3L5 17zm3.5-7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        )}
      </svg>
      {placeholder && <span className={styles.label}>{placeholder}</span>}
    </div>
  )
}

export default SmartImage
