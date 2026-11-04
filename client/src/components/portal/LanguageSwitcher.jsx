import { FaChevronDown, FaGlobe } from 'react-icons/fa6'
import { useLanguage } from '../../hooks/useLanguage.js'
import { LANGUAGES } from '../../templates/labels.js'
import styles from '../../css/portal/LanguageSwitcher.module.css'

// The visitor's language dropdown. Still a real select, so phones show their own easy picker;
// only its closed look is ours, with the icons laid over it.
function LanguageSwitcher() {
  const { language, labels, onChange } = useLanguage()
  if (!onChange) return null

  return (
    <label className={styles.switcher}>
      <FaGlobe className={styles.globe} aria-hidden="true" />
      <span className={styles.hidden}>{labels.chooseLanguage}</span>
      <select className={styles.select} value={language} onChange={(event) => onChange(event.target.value)}>
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code} lang={item.code}>
            {item.name}
          </option>
        ))}
      </select>
      <FaChevronDown className={styles.chevron} aria-hidden="true" />
    </label>
  )
}

export default LanguageSwitcher
