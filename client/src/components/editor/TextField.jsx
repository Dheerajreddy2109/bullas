import styles from '../../css/editor/FieldControls.module.css'

function TextField({ label, value, onChange }) {
  return (
    <label className={styles.label}>
      {label}
      <input
        className={styles.input}
        value={value ?? ''}
        maxLength={300}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export default TextField
