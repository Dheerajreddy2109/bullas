import ImageField from './ImageField.jsx'
import SelectField from './SelectField.jsx'
import TextareaField from './TextareaField.jsx'
import TextField from './TextField.jsx'
import styles from '../../css/editor/ListField.module.css'

const MAX_ITEMS = 50
const ITEM_FIELDS = { text: TextField, textarea: TextareaField, image: ImageField }
const ITEM_LABELS = {
  href: 'Link',
  role: 'Role',
  name: 'Name',
  phone: 'Phone',
  photo: 'Photo',
  title: 'Title',
  date: 'Date',
  place: 'Place',
  image: 'Image',
  caption: 'Caption',
  label: 'Label',
  description: 'Description',
  category: 'Category',
  details: 'Details',
  time: 'Time',
  platform: 'Platform',
}

function ListField({ label, itemFields, value = [], siteId, onChange }) {
  const updateItem = (index, key, nextValue) =>
    onChange(value.map((item, i) => (i === index ? { ...item, [key]: nextValue } : item)))

  const addItem = () =>
    // A choice starts on its first option, the same default the server uses.
    onChange([
      ...value,
      Object.fromEntries(Object.entries(itemFields).map(([key, type]) => [key, type?.options?.[0] ?? ''])),
    ])

  return (
    <fieldset className={styles.list}>
      <legend className={styles.legend}>{label}</legend>
      {value.map((item, index) => (
        <div key={index} className={styles.item}>
          {Object.entries(itemFields).map(([key, type]) => {
            if (type?.type === 'select') {
              return (
                <SelectField
                  key={key}
                  label={ITEM_LABELS[key] ?? key}
                  value={item[key]}
                  options={type.options}
                  onChange={(nextValue) => updateItem(index, key, nextValue)}
                />
              )
            }
            const Field = ITEM_FIELDS[type] ?? TextField
            return (
              <Field
                key={key}
                label={ITEM_LABELS[key] ?? key}
                value={item[key]}
                siteId={siteId}
                onChange={(nextValue) => updateItem(index, key, nextValue)}
              />
            )
          })}
          <button
            className={styles.remove}
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            Remove item
          </button>
        </div>
      ))}
      <button className={styles.add} type="button" disabled={value.length >= MAX_ITEMS} onClick={addItem}>
        Add item
      </button>
    </fieldset>
  )
}

export default ListField
