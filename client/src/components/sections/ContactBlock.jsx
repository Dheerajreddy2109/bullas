import { FaEnvelope, FaLocationDot, FaPhone } from 'react-icons/fa6'
import { telHref } from '../../templates/contentHelpers.js'
import styles from '../../css/sections/ContactBlock.module.css'

// Empty fields are skipped, so a new site never shows blank phone or email cards.
function ContactBlock({ address, phone, email }) {
  const items = [
    address && { Icon: FaLocationDot, label: 'చిరునామా', value: address },
    phone && { Icon: FaPhone, label: 'ఫోన్', value: phone, href: telHref(phone) },
    email && { Icon: FaEnvelope, label: 'ఈమెయిల్', value: email, href: `mailto:${email}` },
  ].filter(Boolean)

  return (
    <div className={styles.contact}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <span className={styles.icon} aria-hidden="true">
            <item.Icon />
          </span>
          <div className={styles.text}>
            <p className={styles.label}>{item.label}</p>
            {item.href ? (
              <a className={styles.value} href={item.href}>
                {item.value}
              </a>
            ) : (
              <p className={styles.value}>{item.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContactBlock
