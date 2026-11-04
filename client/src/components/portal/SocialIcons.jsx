import { FaFacebookF, FaInstagram, FaWhatsapp, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { safeHref } from '../../templates/contentHelpers.js'
import styles from '../../css/portal/SocialIcons.module.css'

const PLATFORMS = {
  facebook: { Icon: FaFacebookF, label: 'Facebook' },
  youtube: { Icon: FaYoutube, label: 'YouTube' },
  instagram: { Icon: FaInstagram, label: 'Instagram' },
  whatsapp: { Icon: FaWhatsapp, label: 'WhatsApp' },
  x: { Icon: FaXTwitter, label: 'X' },
}

// links: [{ platform, href }] from the site's content. Empty links are skipped.
function SocialIcons({ links = [], size = 'small' }) {
  const shown = links.filter((link) => PLATFORMS[link.platform] && link.href)
  if (shown.length === 0) return null

  return (
    <ul className={`${styles.list} ${styles[size]}`}>
      {shown.map((link, index) => {
        const { Icon, label } = PLATFORMS[link.platform]
        return (
          <li key={index}>
            <a
              className={`${styles.icon} ${styles[link.platform]}`}
              href={safeHref(link.href)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <Icon aria-hidden="true" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default SocialIcons
