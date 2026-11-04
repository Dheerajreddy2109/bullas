import { FaArrowRight, FaArrowUp } from 'react-icons/fa6'
import styles from '../../css/portal/ViewAllButton.module.css'

// "View all →" / "Show less" for sections that show only their first few items.
// A button, not a link, because it opens more of this page instead of going somewhere else.
function ViewAllButton({ expanded, onToggle, label, lessLabel = 'తక్కువ చూపించు', small = false }) {
  return (
    <button
      className={`${styles.button} ${small ? styles.small : ''}`}
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
    >
      {expanded ? lessLabel : label}
      {expanded ? <FaArrowUp aria-hidden="true" /> : <FaArrowRight aria-hidden="true" />}
    </button>
  )
}

export default ViewAllButton
