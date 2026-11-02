import styles from '../../css/sections/CardGrid.module.css'

// minWidth is a prop because member cards can be much narrower than product cards.
function CardGrid({ minWidth = 220, children }) {
  return (
    <div className={styles.grid} style={{ '--card-min': `${minWidth}px` }}>
      {children}
    </div>
  )
}

export default CardGrid
