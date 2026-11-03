import ColorField from './ColorField.jsx'
import ImageField from './ImageField.jsx'
import ListField from './ListField.jsx'
import TextareaField from './TextareaField.jsx'
import TextField from './TextField.jsx'
import styles from '../../css/editor/SectionEditor.module.css'

// The template's data picks each control, so a new template needs no new form code.
const FIELD_COMPONENTS = {
  text: TextField,
  textarea: TextareaField,
  color: ColorField,
  image: ImageField,
  list: ListField,
}

function SectionEditor({ section, siteId, onFieldChange }) {
  return (
    <details className={styles.section}>
      <summary className={styles.summary}>{section.label}</summary>
      <div className={styles.fields}>
        {Object.entries(section.fields).map(([key, field]) => {
          const Field = FIELD_COMPONENTS[field.type]
          if (!Field) return null
          return (
            <Field
              key={key}
              label={field.label}
              value={field.value}
              itemFields={field.itemFields}
              siteId={siteId}
              onChange={(value) => onFieldChange(key, value)}
            />
          )
        })}
      </div>
    </details>
  )
}

export default SectionEditor
