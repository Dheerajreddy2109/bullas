import AboutBlock from '../components/sections/AboutBlock.jsx'
import CardGrid from '../components/sections/CardGrid.jsx'
import ContactBlock from '../components/sections/ContactBlock.jsx'
import Container from '../components/sections/Container.jsx'
import InfoCard from '../components/sections/InfoCard.jsx'
import LatestBlogPosts from '../components/sections/LatestBlogPosts.jsx'
import SectionBlock from '../components/sections/SectionBlock.jsx'
import SiteFooter from '../components/sections/SiteFooter.jsx'
import SiteHeader from '../components/sections/SiteHeader.jsx'
import { readContent, safeColor } from './contentHelpers.js'
import { lookFor } from './templateStyles.js'
import styles from '../css/BusinessStarterLayout.module.css'

// latestPosts come from the real blog; the links are props because the admin previews use other addresses.
const defaultPostHref = (post) => `/blog/${encodeURIComponent(post.slug)}`

// extraMenu lets the live site add links, like Blog, that aren't part of the saved content.
function BusinessStarterLayout({ content, extraMenu = [], latestPosts = [], blogHref = '/blog', postHref = defaultPostHref }) {
  const look = lookFor('business-starter')
  const c = readContent(content)
  const brand = safeColor(c.branding?.brandColor, '#1d4ed8')
  const menu = [...(c.menu?.items ?? []), ...extraMenu]

  return (
    <div className={styles.site} style={{ '--brand': brand }}>
      <SiteHeader
        variant="split"
        logo={c.branding?.logo}
        title={c.hero?.title}
        subtitle={c.hero?.subtitle}
        image={c.hero?.image}
        menu={menu}
        // Labels come from the owner's own section titles, so they match the page in any language.
        actions={[
          { label: c.contact?.title, href: '#contact' },
          { label: c.services?.title, href: '#services' },
        ]}
      />

      <Container className={styles.sections}>
        <SectionBlock id="services" title={c.services?.title}>
          <CardGrid minWidth={260}>
            {c.services?.items?.map((item, index) => (
              <InfoCard key={index} image={item.image} title={item.title} lines={[item.description]} />
            ))}
          </CardGrid>
        </SectionBlock>

        <SectionBlock id="about" title={c.about?.title} tone="blue">
          <AboutBlock image={c.about?.image} text={c.about?.text} />
        </SectionBlock>

        <LatestBlogPosts
          posts={latestPosts}
          heading={look.blogHeading}
          viewAllLabel={look.viewAllLabel}
          blogHref={blogHref}
          postHref={postHref}
        />

        <SectionBlock id="contact" title={c.contact?.title}>
          <ContactBlock address={c.contact?.address} phone={c.contact?.phone} email={c.contact?.email} />
        </SectionBlock>
      </Container>

      <SiteFooter title={c.hero?.title} text={c.footer?.text} menu={menu} contact={c.contact} />
    </div>
  )
}

export default BusinessStarterLayout
