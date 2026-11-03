import SiteFooter from './SiteFooter.jsx'
import SiteHeader from './SiteHeader.jsx'
import { readContent, safeColor } from '../../templates/contentHelpers.js'
import { lookFor } from '../../templates/templateStyles.js'
import styles from '../../css/sections/SiteShell.module.css'

// The site's own header and footer around pages that aren't the home page, such as the blog.
function SiteShell({ site, homeHref = '/', blogHref = '/blog', children }) {
  const c = readContent(site.content)
  const look = lookFor(site.templateSlug)
  const title = c.village?.name ?? c.hero?.title ?? site.name

  // Menu links like #members point at home page sections, so they must lead back there.
  const menu = [
    ...(c.menu?.items ?? []).map((item) =>
      item.href?.startsWith('#') ? { ...item, href: `${homeHref}${item.href}` } : item,
    ),
    { label: look.blogLabel, href: blogHref },
  ]

  const theme = {
    '--brand': safeColor(c.branding?.brandColor, '#0b6b3a'),
    '--ink': look.ink,
    '--tint': look.tint,
  }

  return (
    <div className={styles.site} style={theme}>
      <SiteHeader variant={look.variant} logo={c.branding?.logo} title={title} image={c.hero?.image} menu={menu} />
      <main className={styles.main}>{children}</main>
      <SiteFooter title={title} text={c.footer?.text} menu={menu} />
    </div>
  )
}

export default SiteShell
