import styles from '../../css/sections/SectionBlock.module.css'

// The numbered, tinted panels from the design reference; number and tone are optional.
function SectionBlock({ id, number, title, tone = 'plain', children }) {
  return (
    <section id={id} className={`${styles.block} ${styles[tone]}`}>
      <h2 className={styles.heading}>
        {number && (
          <span className={styles.number} aria-hidden="true">
            {number}
          </span>
        )}
        {title}
      </h2>
      {children}
    </section>
  )
}

export default SectionBlock
