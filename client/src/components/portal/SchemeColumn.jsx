import { useState } from 'react'
import SmartImage from '../sections/SmartImage.jsx'
import ViewAllButton from './ViewAllButton.jsx'
import styles from '../../css/portal/SchemeColumn.module.css'

const FIRST_TILES = 5

// One side of the schemes section (central or state): the leader on the left, scheme tiles beside.
// tone picks the panel colour: 'a' for central, 'b' for state.
function SchemeColumn({ title, leader, schemes = [], tone = 'a', viewAllLabel }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? schemes : schemes.slice(0, FIRST_TILES)

  return (
    <div className={`${styles.column} ${styles[tone]}`}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.body}>
        <figure className={styles.leader}>
          <SmartImage className={styles.leaderPhoto} src={leader.photo} alt={leader.name || 'Leader photo'} person />
          <figcaption>
            {leader.name && <strong className={styles.leaderName}>{leader.name}</strong>}
            {leader.title && <span className={styles.leaderTitle}>{leader.title}</span>}
          </figcaption>
        </figure>
        <ul className={styles.tiles}>
          {shown.map((scheme, index) => (
            <li key={index} className={styles.tile}>
              <SmartImage className={styles.icon} src={scheme.image} alt="" />
              <span className={styles.tileTitle}>{scheme.title}</span>
            </li>
          ))}
        </ul>
      </div>
      {schemes.length > FIRST_TILES && (
        <div className={styles.footer}>
          <ViewAllButton expanded={expanded} onToggle={() => setExpanded((current) => !current)} label={viewAllLabel} small />
        </div>
      )}
    </div>
  )
}

export default SchemeColumn
