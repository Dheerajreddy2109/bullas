import styles from '../../css/sections/CardGrid.module.css'

// Cards share each row equally and fill it edge to edge, so rows never stop short on the right.
// minWidth is the narrowest a card may get before the row wraps.
function CardGrid({ minWidth = 220, children }) {
  return (
    <div className={styles.grid} style={{ '--card-min': `${minWidth}px` }}>
      {children}
    </div>
  )
}

export default CardGrid
