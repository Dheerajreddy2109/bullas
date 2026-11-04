import { Children, useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import styles from '../../css/sections/CardCarousel.module.css'

// A sideways row of cards. Arrows move one card at a time and disappear at each end,
// so they never promise more cards than there are. Phones swipe instead.
function CardCarousel({ children, label = 'Cards' }) {
  const trackRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const count = Children.count(children)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    // The 2px allowance covers browsers that round scroll positions to fractions.
    function update() {
      setCanPrev(track.scrollLeft > 2)
      setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 2)
    }

    track.addEventListener('scroll', update, { passive: true })
    // Also runs once straight away, and again whenever the row changes width.
    const observer = new ResizeObserver(update)
    observer.observe(track)

    return () => {
      track.removeEventListener('scroll', update)
      observer.disconnect()
    }
    // A different number of cards changes how far the row can scroll.
  }, [count])

  function scroll(direction) {
    const track = trackRef.current
    const first = track.firstElementChild
    if (!first) return
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0
    // Some people get motion sickness from sliding, and their device can ask us not to do it.
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: calm ? 'auto' : 'smooth' })
  }

  return (
    <div className={styles.carousel} role="group" aria-label={label}>
      <button className={styles.arrow} type="button" aria-label="Previous" disabled={!canPrev} onClick={() => scroll(-1)}>
        <FaChevronLeft aria-hidden="true" />
      </button>
      {/* tabIndex lets keyboard users focus the row and move it with the arrow keys. */}
      <div className={styles.track} ref={trackRef} tabIndex={0}>
        {children}
      </div>
      <button className={styles.arrow} type="button" aria-label="Next" disabled={!canNext} onClick={() => scroll(1)}>
        <FaChevronRight aria-hidden="true" />
      </button>
    </div>
  )
}

export default CardCarousel
