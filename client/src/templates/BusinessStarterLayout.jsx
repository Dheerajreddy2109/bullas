import AboutBlock from '../components/sections/AboutBlock.jsx'
import CardGrid from '../components/sections/CardGrid.jsx'
import ContactBlock from '../components/sections/ContactBlock.jsx'
import InfoCard from '../components/sections/InfoCard.jsx'
import SectionBlock from '../components/sections/SectionBlock.jsx'
import SiteFooter from '../components/sections/SiteFooter.jsx'
import SiteHeader from '../components/sections/SiteHeader.jsx'
import { readContent, safeColor } from './contentHelpers.js'
import styles from '../css/BusinessStarterLayout.module.css'

function BusinessStarterLayout({ content }) {
  const c = readContent(content)
  const brand = safeColor(c.branding?.brandColor, '#1d4ed8')

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
        <SectionBlock id="services" title={c.services?.title}>
          <CardGrid minWidth={260}>
            {c.services?.items?.map((item, index) => (
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

export default BusinessStarterLayout
