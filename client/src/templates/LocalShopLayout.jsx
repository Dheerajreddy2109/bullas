import AboutBlock from '../components/sections/AboutBlock.jsx'
import CardCarousel from '../components/sections/CardCarousel.jsx'
import CardGrid from '../components/sections/CardGrid.jsx'
import ContactBlock from '../components/sections/ContactBlock.jsx'
import InfoCard from '../components/sections/InfoCard.jsx'
import SectionBlock from '../components/sections/SectionBlock.jsx'
import SiteFooter from '../components/sections/SiteFooter.jsx'
import SiteHeader from '../components/sections/SiteHeader.jsx'
import { readContent, safeColor } from './contentHelpers.js'
import styles from '../css/LocalShopLayout.module.css'

function LocalShopLayout({ content }) {
  const c = readContent(content)
  const brand = safeColor(c.branding?.brandColor, '#c2410c')

  return (
    <div className={styles.site} style={{ '--brand': brand }}>
      <SiteHeader
        variant="split"
        logo={c.branding?.logo}
        title={c.hero?.title}
        subtitle={c.hero?.subtitle}
        image={c.hero?.image}
        menu={c.menu?.items}
      />
      <main className={styles.sections}>
        <SectionBlock id="offers" number={1} title={c.offers?.title} tone="peach">
          <CardCarousel>
            {c.offers?.items?.map((item, index) => (
              <InfoCard key={index} image={item.image} title={item.title} lines={[item.description]} />
            ))}
          </CardCarousel>
        </SectionBlock>
        <SectionBlock id="products" number={2} title={c.products?.title} tone="cream">
          <CardGrid minWidth={200}>
            {c.products?.items?.map((item, index) => (
              <InfoCard key={index} image={item.image} title={item.title} lines={[item.description]} />
            ))}
          </CardGrid>
        </SectionBlock>
        <SectionBlock id="about" number={3} title={c.about?.title} tone="green">
          <AboutBlock image={c.about?.image} text={c.about?.text} />
        </SectionBlock>
        <SectionBlock id="contact" number={4} title={c.contact?.title} tone="blue">
          <ContactBlock address={c.contact?.address} phone={c.contact?.phone} email={c.contact?.email} />
        </SectionBlock>
      </main>
      <SiteFooter title={c.footer?.text} menu={c.menu?.items} />
    </div>
  )
}

export default LocalShopLayout
