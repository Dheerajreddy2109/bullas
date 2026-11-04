import { POST_CATEGORIES } from './postCategories.js'
import styles from '../../css/blog/CategoryChips.module.css'

// "All" plus one chip per category. value '' means all posts.
function CategoryChips({ value, onChange }) {
  const chips = [{ value: '', label: 'All' }, ...POST_CATEGORIES]

  return (
    <div className={styles.chips} role="group" aria-label="Filter posts by category">
      {chips.map((chip) => (
        <button
          key={chip.value || 'all'}
          type="button"
          className={`${styles.chip} ${value === chip.value ? styles.active : ''}`}
          aria-pressed={value === chip.value}
          onClick={() => onChange(chip.value)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryChips
