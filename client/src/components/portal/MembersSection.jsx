import { useState } from 'react'
import SectionBlock from '../sections/SectionBlock.jsx'
import MemberCard from './MemberCard.jsx'
import ViewAllButton from './ViewAllButton.jsx'
import styles from '../../css/portal/MembersSection.module.css'

// One row of elders fits on a laptop screen; the rest open with "View all".
const FIRST_ROW = 7

function MembersSection({ number, title, people = [] }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? people : people.slice(0, FIRST_ROW)
  const canExpand = people.length > FIRST_ROW

  return (
    <SectionBlock
      id="members"
      number={number}
      title={title}
      tone="cream"
      action={
        canExpand && (
          <ViewAllButton
            expanded={expanded}
            onToggle={() => setExpanded((current) => !current)}
            label="అందరు సభ్యులను చూడండి"
          />
        )
      }
    >
      <div className={styles.grid}>
        {shown.map((person, index) => (
          <MemberCard key={index} person={person} />
        ))}
      </div>
    </SectionBlock>
  )
}

export default MembersSection
