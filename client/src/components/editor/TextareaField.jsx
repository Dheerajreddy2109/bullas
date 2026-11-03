import styles from '../../css/editor/FieldControls.module.css'

function TextareaField({ label, value, onChange }) {
  return (
    <label className={styles.label}>
      {label}
      <textarea
        className={styles.input}
        rows={4}
        value={value ?? ''}
        maxLength={5000}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export default TextareaField
