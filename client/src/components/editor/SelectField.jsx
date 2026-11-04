import styles from '../../css/editor/FieldControls.module.css'

// A fixed list of choices; the server refuses anything else, so a typo can't break filters.
const CHOICE_LABELS = {
  birthday: 'Birthday',
  wedding: 'Wedding',
  business: 'Business',
  jobs: 'Jobs',
  others: 'Others',
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  x: 'X (Twitter)',
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className={styles.label}>
      {label}
      <select className={styles.input} value={value || options[0]} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {CHOICE_LABELS[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SelectField
