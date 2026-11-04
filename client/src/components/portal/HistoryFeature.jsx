import { useState } from 'react'
import SmartImage from '../sections/SmartImage.jsx'
import styles from '../../css/portal/HistoryFeature.module.css'

// Long enough that showing it all would push the rest of the section far down.
const LONG_TEXT = 320

// The featured village history (or information) card: picture on the left, text with "Read more".
function HistoryFeature({ title, text = '', image }) {
  const [open, setOpen] = useState(false)
  const isLong = text.length > LONG_TEXT

  return (
    <article className={styles.feature}>
      <SmartImage className={styles.image} src={image} alt={title} />
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={`${styles.text} ${isLong && !open ? styles.clamped : ''}`}>{text}</p>
        {isLong && (
          <button className={styles.more} type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
            {open ? 'తక్కువ చూపించు ↑' : 'ఇంకా చదవండి →'}
          </button>
        )}
      </div>
    </article>
  )
}

export default HistoryFeature
