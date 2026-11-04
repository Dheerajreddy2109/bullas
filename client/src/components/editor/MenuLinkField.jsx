import { useState } from 'react'
import styles from '../../css/editor/FieldControls.module.css'

// Must match the section ids on the page and the blog's categories.
const GROUPS = [
  {
    label: 'A section on the home page',
    options: [
      { value: '#top', label: 'Top of the page (Home)' },
      { value: '#members', label: 'Village elders and committee' },
      { value: '#schemes', label: 'Government schemes' },
      { value: '#posts', label: 'Posts' },
      { value: '#events', label: 'Village events and programs' },
      { value: '#announcements', label: 'Announcements' },
      { value: '#contact', label: 'Contact details' },
    ],
  },
  {
    label: 'One kind of blog post',
    options: [
      { value: '/blog?category=history', label: 'Village history posts' },
      { value: '/blog?category=daily', label: 'Daily updates' },
      { value: '/blog?category=announcement', label: 'Announcement posts' },
      { value: '/blog?category=gallery', label: 'Photo gallery posts' },
    ],
  },
]
const KNOWN = GROUPS.flatMap((group) => group.options.map((option) => option.value))
const OTHER = 'other'

// Where a menu item goes, chosen from a list so a typing mistake can't make a dead link.
// Anything not on the list, such as an outside website, is typed in; the server still checks it.
function MenuLinkField({ label, value = '', onChange }) {
  const [wantsOther, setWantsOther] = useState(false)
  const isKnown = KNOWN.includes(value)
  const showOther = !isKnown && (wantsOther || value !== '')

  function choose(next) {
    setWantsOther(next === OTHER)
    onChange(next === OTHER ? '' : next)
  }

  return (
    <div className={styles.label}>
      <label className={styles.label}>
        {label}
        <select className={styles.input} value={isKnown ? value : showOther ? OTHER : ''} onChange={(event) => choose(event.target.value)}>
          <option value="">Choose where this goes...</option>
          {GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={OTHER}>Another website or address...</option>
        </select>
      </label>
      {showOther && (
        <label className={styles.label}>
          Address
          <input
            className={styles.input}
            value={value}
            maxLength={300}
            placeholder="https://example.com"
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      )}
    </div>
  )
}

export default MenuLinkField
