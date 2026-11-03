import SectionEditor from './SectionEditor.jsx'
import styles from '../../css/editor/ContentEditor.module.css'

function ContentEditor({ content, siteId, onChange }) {
  // Builds a new object rather than editing in place, because React only redraws on a new value.
  function updateField(sectionKey, fieldKey, value) {
    onChange({
      ...content,
      sections: content.sections.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              fields: {
                ...section.fields,
                [fieldKey]: { ...section.fields[fieldKey], value },
              },
            }
          : section,
      ),
    })
  }

  return (
    <div className={styles.editor}>
      {content.sections.map((section) => (
        <SectionEditor
          key={section.key}
          section={section}
          siteId={siteId}
          onFieldChange={(fieldKey, value) => updateField(section.key, fieldKey, value)}
        />
      ))}
    </div>
  )
}

export default ContentEditor
