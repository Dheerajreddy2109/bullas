import AboutBlock from '../components/sections/AboutBlock.jsx'
import CardCarousel from '../components/sections/CardCarousel.jsx'
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
import styles from '../css/LocalShopLayout.module.css'

// latestPosts come from the real blog; the links are props because the admin previews use other addresses.
const defaultPostHref = (post) => `/blog/${encodeURIComponent(post.slug)}`

// extraMenu lets the live site add links, like Blog, that aren't part of the saved content.
function LocalShopLayout({ content, extraMenu = [], latestPosts = [], blogHref = '/blog', postHref = defaultPostHref }) {
  const look = lookFor('local-shop')
  // Numbers stay in order whether or not the blog section is shown.
  const hasPosts = latestPosts.length > 0
  const c = readContent(content)
  const brand = safeColor(c.branding?.brandColor, '#c2410c')
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
          { label: c.offers?.title, href: '#offers' },
          { label: c.contact?.title, href: '#contact' },
        ]}
      />

      <Container className={styles.sections}>
        <SectionBlock id="offers" number={1} title={c.offers?.title} tone="peach">
          <CardCarousel>
            {c.offers?.items?.map((item, index) => (
              <InfoCard key={index} image={item.image} title={item.title} lines={[item.description]} />
            ))}
          </CardCarousel>
        </SectionBlock>

        <SectionBlock id="products" number={2} title={c.products?.title} tone="cream">
          <CardGrid minWidth={210}>
            {c.products?.items?.map((item, index) => (
              <InfoCard key={index} image={item.image} title={item.title} lines={[item.description]} />
            ))}
          </CardGrid>
        </SectionBlock>

        <SectionBlock id="about" number={3} title={c.about?.title} tone="green">
          <AboutBlock image={c.about?.image} text={c.about?.text} />
        </SectionBlock>

        <LatestBlogPosts
          posts={latestPosts}
          heading={look.blogHeading}
          viewAllLabel={look.viewAllLabel}
          blogHref={blogHref}
          postHref={postHref}
          number={4}
          tone="peach"
        />

        <SectionBlock id="contact" number={hasPosts ? 5 : 4} title={c.contact?.title} tone="blue">
          <ContactBlock address={c.contact?.address} phone={c.contact?.phone} email={c.contact?.email} />
        </SectionBlock>
      </Container>

      <SiteFooter title={c.hero?.title} text={c.footer?.text} menu={menu} contact={c.contact} />
    </div>
  )
}

export default LocalShopLayout
