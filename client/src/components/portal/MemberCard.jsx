import { FaWhatsapp } from 'react-icons/fa6'
import SmartImage from '../sections/SmartImage.jsx'
import { telHref } from '../../templates/contentHelpers.js'
import styles from '../../css/portal/MemberCard.module.css'

// WhatsApp needs the full number with the country code; Indian 10-digit numbers get 91 added.
function whatsappHref(phone) {
  const digits = String(phone).replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`
}

// One village elder: photo, role, name, and a phone number that calls when tapped.
function MemberCard({ person }) {
  const whatsapp = person.phone && whatsappHref(person.phone)

  return (
    <article className={styles.card}>
      <SmartImage className={styles.photo} src={person.photo} alt={person.name} person />
      <div className={styles.body}>
        {person.role && <p className={styles.role}>{person.role}</p>}
        {person.name && <h3 className={styles.name}>{person.name}</h3>}
        {person.phone && (
          <div className={styles.contact}>
            {whatsapp && (
              <a className={styles.whatsapp} href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <FaWhatsapp aria-hidden="true" />
              </a>
            )}
            <a className={styles.phone} href={telHref(person.phone)}>
              {person.phone}
            </a>
          </div>
        )}
      </div>
    </article>
  )
}

export default MemberCard
