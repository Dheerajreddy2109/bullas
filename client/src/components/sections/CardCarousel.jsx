import { useRef } from 'react'
import styles from '../../css/sections/CardCarousel.module.css'

function CardCarousel({ children }) {
  const trackRef = useRef(null)

  function scroll(direction) {
    trackRef.current.scrollBy({ left: direction * 260, behavior: 'smooth' })
  }

  return (
    <div className={styles.carousel}>
      <button className={styles.arrow} type="button" aria-label="Previous" onClick={() => scroll(-1)}>
        ‹
      </button>
      <div className={styles.track} ref={trackRef}>
        {children}
      </div>
      <button className={styles.arrow} type="button" aria-label="Next" onClick={() => scroll(1)}>
        ›
      </button>
    </div>
  )
}

export default CardCarousel
