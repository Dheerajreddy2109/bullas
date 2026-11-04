import SmartImage from './SmartImage.jsx'
import styles from '../../css/sections/AboutBlock.module.css'

// Text is rendered by React, which escapes it, so owner content can't inject HTML here.
// quote styles the text as a message, such as the Sarpanch's welcome.
function AboutBlock({ image, title, text, photoLabel, quote = false }) {
  return (
    <div className={styles.about}>
      <div className={styles.media}>
        <SmartImage src={image} alt={title ?? ''} placeholder={photoLabel} />
      </div>
      <div className={styles.content}>
        {title && <h3 className={styles.title}>{title}</h3>}
        <p className={`${styles.text} ${quote ? styles.quote : ''}`}>{text}</p>
      </div>
    </div>
  )
}

export default AboutBlock
