import AboutBlock from '../components/sections/AboutBlock.jsx'
import CardGrid from '../components/sections/CardGrid.jsx'
import ContactBlock from '../components/sections/ContactBlock.jsx'
import InfoCard from '../components/sections/InfoCard.jsx'
import SectionBlock from '../components/sections/SectionBlock.jsx'
import SiteFooter from '../components/sections/SiteFooter.jsx'
import SiteHeader from '../components/sections/SiteHeader.jsx'
import { readContent, safeColor } from './contentHelpers.js'
import styles from '../css/PortfolioLightLayout.module.css'

function PortfolioLightLayout({ content }) {
  const c = readContent(content)
  const brand = safeColor(c.branding?.brandColor, '#7c3aed')

  return (
    <div className={styles.site} style={{ '--brand': brand }}>
      <SiteHeader
        variant="minimal"
        logo={c.branding?.logo}
        title={c.hero?.title}
        subtitle={c.hero?.subtitle}
        image={c.hero?.image}
        menu={c.menu?.items}
      />
      <main className={styles.sections}>
        <SectionBlock id="work" title={c.work?.title}>
          <CardGrid minWidth={420}>
            {c.work?.items?.map((item, index) => (
              <InfoCard key={index} image={item.image} title={item.title} lines={[item.description]} />
            ))}
          </CardGrid>
        </SectionBlock>
        <SectionBlock id="about" title={c.about?.title}>
          <AboutBlock image={c.about?.image} text={c.about?.text} />
        </SectionBlock>
        <SectionBlock id="contact" title={c.contact?.title}>
          <ContactBlock address={c.contact?.address} phone={c.contact?.phone} email={c.contact?.email} />
        </SectionBlock>
      </main>
      <SiteFooter title={c.footer?.text} menu={c.menu?.items} />
    </div>
  )
}

export default PortfolioLightLayout
