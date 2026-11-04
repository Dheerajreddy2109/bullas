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
import styles from '../css/PortfolioLightLayout.module.css'

// latestPosts come from the real blog; the links are props because the admin previews use other addresses.
const defaultPostHref = (post) => `/blog/${encodeURIComponent(post.slug)}`

// extraMenu lets the live site add links, like Blog, that aren't part of the saved content.
function PortfolioLightLayout({ content, extraMenu = [], latestPosts = [], blogHref = '/blog', postHref = defaultPostHref }) {
  const look = lookFor('portfolio-light')
  const c = readContent(content)
  const brand = safeColor(c.branding?.brandColor, '#7c3aed')
  const menu = [...(c.menu?.items ?? []), ...extraMenu]

  return (
    <div className={styles.site} style={{ '--brand': brand }}>
      <SiteHeader
        variant="minimal"
        logo={c.branding?.logo}
        title={c.hero?.title}
        subtitle={c.hero?.subtitle}
        image={c.hero?.image}
        menu={menu}
        // Labels come from the owner's own section titles, so they match the page in any language.
        actions={[
          { label: c.work?.title, href: '#work' },
          { label: c.contact?.title, href: '#contact' },
        ]}
      />

      <Container className={styles.sections}>
        {/* Two large projects per row: a portfolio is about seeing the work, not many small thumbnails. */}
        <SectionBlock id="work" title={c.work?.title}>
          <CardGrid minWidth={420}>
            {c.work?.items?.map((item, index) => (
              <InfoCard key={index} image={item.image} title={item.title} lines={[item.description]} />
            ))}
          </CardGrid>
        </SectionBlock>

        <SectionBlock id="about" title={c.about?.title} tone="white">
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

export default PortfolioLightLayout
