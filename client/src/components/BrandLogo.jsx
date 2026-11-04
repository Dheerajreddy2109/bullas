import { Link } from 'react-router-dom'
import styles from '../css/BrandLogo.module.css'

// A logo on a white card, so logos with a white background still look right on dark panels.
// size: 'sidebar' (top of the admin menu) or 'login' (above the login form).
function BrandLogo({ src, alt, to, size = 'sidebar' }) {
  const className = `${styles.logo} ${styles[size]}`
  const image = <img className={styles.image} src={src} alt={alt} />

  return to ? (
    <Link className={className} to={to}>
      {image}
    </Link>
  ) : (
    <div className={className}>{image}</div>
  )
}

export default BrandLogo
