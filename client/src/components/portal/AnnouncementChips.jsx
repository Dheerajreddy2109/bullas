import { ANNOUNCEMENT_CATEGORIES } from './announcementCategories.js'
import { useLanguage } from '../../hooks/useLanguage.js'
import styles from '../../css/portal/AnnouncementChips.module.css'

// "All" plus one chip for each category that has announcements. value '' means all of them.
function AnnouncementChips({ categories, value, onChange }) {
  const { labels } = useLanguage()
  const chips = [
    { value: '', label: labels.all },
    ...ANNOUNCEMENT_CATEGORIES.filter((item) => categories.includes(item.value)).map((item) => ({
      value: item.value,
      label: labels[`ann_${item.value}`],
    })),
  ]

  return (
    <div className={styles.chips} role="group" aria-label={labels.chooseCategory}>
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

export default AnnouncementChips
