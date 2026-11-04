import SmartImage from '../sections/SmartImage.jsx'
import styles from '../../css/portal/PhotoGrid.module.css'

// The site's gallery photos, with each caption over the bottom of its picture.
function PhotoGrid({ photos = [] }) {
  if (photos.length === 0) return null

  return (
    <ul className={styles.grid}>
      {photos.map((photo, index) => (
        <li key={index} className={styles.item}>
          <SmartImage className={styles.image} src={photo.image} alt={photo.caption} />
          {photo.caption && <span className={styles.caption}>{photo.caption}</span>}
        </li>
      ))}
    </ul>
  )
}

export default PhotoGrid
