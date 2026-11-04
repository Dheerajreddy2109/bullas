import Container from './Container.jsx'
import PortalFooter from '../portal/PortalFooter.jsx'
import PortalBanner from '../portal/PortalBanner.jsx'
import PortalTopBar from '../portal/PortalTopBar.jsx'
import { readContent, safeColor } from '../../templates/contentHelpers.js'
import { lookFor } from '../../templates/templateStyles.js'
import { themeFor } from '../../templates/themes.js'
import styles from '../../css/sections/SiteShell.module.css'

// The site's own header and footer around pages that aren't the home page, such as the blog.
function SiteShell({ site, homeHref = '/', blogHref = '/blog', children }) {
  const c = readContent(site.content)
  const look = lookFor(site.templateSlug)
  const title = c.village?.name ?? site.name

  // Menu links like #members point at home page sections, so they must lead back there.
  const menu = [
    ...(c.menu?.items ?? []).map((item) =>
      item.href?.startsWith('#') ? { ...item, href: `${homeHref}${item.href}` } : item,
    ),
    { label: look.blogLabel, href: blogHref },
  ]

  const themeLook = themeFor(site.templateSlug)
  const theme = {
    ...themeLook.vars,
    '--brand': safeColor(c.branding?.brandColor, '#0b6b3a'),
  }

  return (
    <div className={styles.site} data-look={themeLook.look} style={theme}>
      <PortalTopBar
        state={c.topBar?.state}
        district={c.topBar?.district}
        mandal={c.topBar?.mandal}
        village={c.topBar?.village}
        social={c.topBar?.social}
      />
      {/* Compact on blog pages, so the post is visible without scrolling past the leaders. */}
      <PortalBanner village={c.village} logo={c.branding?.logo} menu={menu} compact />
      <main className={styles.main}>
        <Container>{children}</Container>
      </main>
      <PortalFooter villageName={title} footer={c.footer} logo={c.branding?.logo} menu={menu} social={c.topBar?.social} />
    </div>
  )
}

export default SiteShell
