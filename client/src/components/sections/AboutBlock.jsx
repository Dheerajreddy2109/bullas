import SmartImage from './SmartImage.jsx'
import styles from '../../css/sections/AboutBlock.module.css'

// Text is rendered by React, which escapes it, so owner content can't inject HTML here.
function AboutBlock({ image, title, text, photoLabel }) {
  return (
    <div className={styles.about}>
      <SmartImage className={styles.image} src={image} alt={title} placeholder={photoLabel} />
      <div>
        {title && <h3 className={styles.title}>{title}</h3>}
        <p className={styles.text}>{text}</p>
      </div>
    </div>
  )
}

export default AboutBlock
