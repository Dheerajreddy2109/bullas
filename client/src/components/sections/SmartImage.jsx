import styles from '../../css/sections/SmartImage.module.css'

// New sites have empty image fields, so this keeps the page's shape until photos are added.
function SmartImage({ src, alt, placeholder = 'Photo', className = '' }) {
  if (src) return <img className={`${styles.image} ${className}`} src={src} alt={alt} />

  return (
    <div className={`${styles.placeholder} ${className}`} role="img" aria-label={alt}>
      {placeholder}
    </div>
  )
}

export default SmartImage
