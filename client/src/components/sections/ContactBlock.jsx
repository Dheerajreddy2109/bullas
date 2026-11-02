import { telHref } from '../../templates/contentHelpers.js'
import styles from '../../css/sections/ContactBlock.module.css'

// Empty fields are skipped, so a new site never shows blank phone or email lines.
function ContactBlock({ address, phone, email }) {
  return (
    <div className={styles.contact}>
      {address && <p className={styles.address}>{address}</p>}
      {phone && (
        <a className={styles.link} href={telHref(phone)}>
          {phone}
        </a>
      )}
      {email && (
        <a className={styles.link} href={`mailto:${email}`}>
          {email}
        </a>
      )}
    </div>
  )
}

export default ContactBlock
