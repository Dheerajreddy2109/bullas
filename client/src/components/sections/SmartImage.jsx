import { FaImage, FaUser } from 'react-icons/fa6'
import styles from '../../css/sections/SmartImage.module.css'

// New sites have empty image fields, so this keeps the page's shape until photos are added.
// round makes a circle, for people's photos. person shows a person icon in any shape.
function SmartImage({ src, alt, placeholder, round = false, person = round, className = '' }) {
  const shape = round ? styles.round : ''

  if (src) return <img className={`${styles.image} ${shape} ${className}`} src={src} alt={alt} loading="lazy" />

  return (
    <div className={`${styles.placeholder} ${shape} ${className}`} role="img" aria-label={alt}>
      {person ? <FaUser className={styles.icon} aria-hidden="true" /> : <FaImage className={styles.icon} aria-hidden="true" />}
      {placeholder && <span className={styles.label}>{placeholder}</span>}
    </div>
  )
}

export default SmartImage
