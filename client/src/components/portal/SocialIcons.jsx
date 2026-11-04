import { safeHref } from '../../templates/contentHelpers.js'
import styles from '../../css/portal/SocialIcons.module.css'

// Simple shapes drawn here, so no icon library or outside request is needed.
const ICONS = {
  facebook: 'M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z',
  youtube: 'M21.6 7.2a2.7 2.7 0 00-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 00-1.9 1.9C2 8.9 2 12 2 12s0 3.1.4 4.8a2.7 2.7 0 001.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 001.9-1.9c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8zM10 15V9l5.2 3L10 15z',
  instagram: 'M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zM17.3 5.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM12 3.8c2.7 0 3 0 4 .1 2.7.1 4 1.4 4.1 4.1.1 1 .1 1.4.1 4s0 3-.1 4c-.1 2.7-1.4 4-4.1 4.1-1 .1-1.4.1-4 .1s-3 0-4-.1c-2.7-.1-4-1.4-4.1-4.1-.1-1-.1-1.4-.1-4s0-3 .1-4C4 5.3 5.3 4 8 3.9c1-.1 1.3-.1 4-.1z',
  whatsapp: 'M12 2.5a9.5 9.5 0 00-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1012 2.5zm5.4 13.4c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.4.1.1.1.7-.1 1.3z',
  x: 'M17.7 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2l7.3-8.4L1.7 3h6.4l4.4 5.9L17.7 3zm-1.1 16.2h1.7L7.5 4.7H5.7l10.9 14.5z',
}

const LABELS = { facebook: 'Facebook', youtube: 'YouTube', instagram: 'Instagram', whatsapp: 'WhatsApp', x: 'X' }

// links: [{ platform, href }] from the site's content. Empty links are skipped.
function SocialIcons({ links = [], size = 'small' }) {
  const shown = links.filter((link) => ICONS[link.platform] && link.href)
  if (shown.length === 0) return null

  return (
    <ul className={`${styles.list} ${styles[size]}`}>
      {shown.map((link, index) => (
        <li key={index}>
          <a
            className={`${styles.icon} ${styles[link.platform]}`}
            href={safeHref(link.href)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={LABELS[link.platform]}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={ICONS[link.platform]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default SocialIcons
