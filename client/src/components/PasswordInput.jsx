import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import styles from '../css/PasswordInput.module.css'

// One password box with a show/hide button, so every form behaves the same way.
// Hidden by default, so a password isn't shown to someone looking over the person's shoulder.
function PasswordInput({ className = '', ...inputProps }) {
  const [visible, setVisible] = useState(false)

  return (
    <span className={styles.wrapper}>
      <input {...inputProps} className={`${className} ${styles.input}`} type={visible ? 'text' : 'password'} />
      <button
        className={styles.toggle}
        type="button"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
      </button>
    </span>
  )
}

export default PasswordInput
