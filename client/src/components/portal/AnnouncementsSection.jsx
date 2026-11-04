import { useState } from 'react'
import SectionBlock from '../sections/SectionBlock.jsx'
import AnnouncementCard from './AnnouncementCard.jsx'
import AnnouncementChips from './AnnouncementChips.jsx'
import ViewAllButton from './ViewAllButton.jsx'
import styles from '../../css/portal/AnnouncementsSection.module.css'

const FIRST_ROW = 5

// Birthdays, weddings, business notices and more, with chips to show one kind at a time.
// The layout leaves this out when there are no announcements.
function AnnouncementsSection({ number, title, subtitle, items = [] }) {
  const [chosen, setChosen] = useState('')
  const [expanded, setExpanded] = useState(false)

  const categories = [...new Set(items.map((item) => item.category))]
  // In the editor's live preview, the chosen kind can vanish when its last item is removed.
  const active = categories.includes(chosen) ? chosen : ''
  const matching = active ? items.filter((item) => item.category === active) : items
  const shown = expanded ? matching : matching.slice(0, FIRST_ROW)

  function choose(next) {
    setChosen(next)
    setExpanded(false)
  }

  return (
    <SectionBlock
      id="announcements"
      number={number}
      title={title}
      tone="cream"
      // One kind of announcement has nothing to filter, so no chips.
      action={categories.length > 1 && <AnnouncementChips categories={categories} value={active} onChange={choose} />}
    >
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.grid}>
        {shown.map((item, index) => (
          <AnnouncementCard key={`${item.title}-${index}`} item={item} />
        ))}
      </div>
      {matching.length > FIRST_ROW && (
        <div className={styles.footer}>
          <ViewAllButton
            expanded={expanded}
            onToggle={() => setExpanded((current) => !current)}
            label="అన్ని ప్రకటనలు చూడండి"
          />
        </div>
      )}
    </SectionBlock>
  )
}

export default AnnouncementsSection
