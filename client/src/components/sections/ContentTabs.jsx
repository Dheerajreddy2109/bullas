import { useState } from 'react'
import styles from '../../css/sections/ContentTabs.module.css'

function ContentTabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0)

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
            onClick={() => setActiveIndex(index)}
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
