import styles from '../../css/sections/SectionBlock.module.css'

// One section of a page, with the same heading style and spacing everywhere.
// number shows a numbered badge (village portal); tone gives a soft background panel.
function SectionBlock({ id, number, title, tone = 'plain', action, children }) {
  return (
    <section id={id} className={`${styles.block} ${styles[tone] ?? ''}`}>
      <div className={styles.header}>
        <h2 className={styles.heading}>
          {number && (
            <span className={styles.number} aria-hidden="true">
              {number}
            </span>
          )}
          <span>{title}</span>
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default SectionBlock
