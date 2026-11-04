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
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.5a9.5 9.5 0 00-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1012 2.5zm5.4 13.4c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.4.1.1.1.7-.1 1.3z" />
                </svg>
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
