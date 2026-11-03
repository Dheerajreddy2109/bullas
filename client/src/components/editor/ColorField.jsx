import styles from '../../css/editor/FieldControls.module.css'

function ColorField({ label, value, onChange }) {
  return (
    <label className={styles.label}>
      {label}
      <input
        className={styles.color}
        type="color"
        value={value ?? '#000000'}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export default ColorField
