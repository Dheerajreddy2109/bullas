import { useState } from 'react'
import styles from '../../css/sections/ContentTabs.module.css'

// preferredIndex is the tab to show until the visitor picks one. It's worked out rather than stored,
// so it can still change when late content arrives, but it never overrides the visitor's own click.
function ContentTabs({ tabs, preferredIndex = 0 }) {
  const [chosenIndex, setChosenIndex] = useState(null)
  const activeIndex = chosenIndex ?? preferredIndex

  return (
    <div>
      <div className={styles.tabs} role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tab} ${index === activeIndex ? styles.active : ''}`}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            onClick={() => setChosenIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.panel} role="tabpanel">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  )
}

export default ContentTabs
