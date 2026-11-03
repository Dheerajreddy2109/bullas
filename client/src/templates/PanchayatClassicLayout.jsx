import AboutBlock from '../components/sections/AboutBlock.jsx'
import CardCarousel from '../components/sections/CardCarousel.jsx'
import CardGrid from '../components/sections/CardGrid.jsx'
import ContactBlock from '../components/sections/ContactBlock.jsx'
import ContentTabs from '../components/sections/ContentTabs.jsx'
import InfoCard from '../components/sections/InfoCard.jsx'
import LatestPosts from '../components/sections/LatestPosts.jsx'
import SchemePanel from '../components/sections/SchemePanel.jsx'
import SectionBlock from '../components/sections/SectionBlock.jsx'
import SiteFooter from '../components/sections/SiteFooter.jsx'
import SiteHeader from '../components/sections/SiteHeader.jsx'
import { readContent, safeColor } from './contentHelpers.js'
import styles from '../css/PanchayatClassicLayout.module.css'

const PHOTO = 'ఫోటో'

// extraMenu lets the live site add links, like Blog, that aren't part of the saved content.
function PanchayatClassicLayout({ content, extraMenu = [] }) {
  const c = readContent(content)
  const brand = safeColor(c.branding?.brandColor, '#0b6b3a')

  return (
    <div className={styles.site} style={{ '--brand': brand }}>
      <div className={styles.topBar}>{c.village?.location}</div>
      <SiteHeader
        variant="banner"
        logo={c.branding?.logo}
        title={c.village?.name}
        subtitle={c.village?.englishName && `(${c.village.englishName})`}
        location={c.village?.location}
        tagline={c.village?.tagline}
        menu={[...(c.menu?.items ?? []), ...extraMenu]}
      />
      <main className={styles.sections}>
        <SectionBlock id="members" number={1} title={c.members?.title} tone="cream">
          <CardGrid minWidth={150}>
            {c.members?.people?.map((person, index) => (
              <InfoCard
                key={index}
                image={person.photo}
                overline={person.role}
                title={person.name}
                phone={person.phone}
                photoLabel={PHOTO}
              />
            ))}
          </CardGrid>
        </SectionBlock>

        <SectionBlock id="message" number={2} title={c.sarpanchMessage?.title} tone="green">
          <AboutBlock image={c.sarpanchMessage?.photo} text={c.sarpanchMessage?.message} photoLabel={PHOTO} />
        </SectionBlock>

        <SectionBlock id="schemes" number={3} title={c.schemes?.title} tone="blue">
          <div className={styles.twoPanels}>
            <SchemePanel title={c.schemes?.centralTitle} schemes={c.schemes?.central} tone="peach" photoLabel={PHOTO} />
            <SchemePanel title={c.schemes?.stateTitle} schemes={c.schemes?.state} tone="pink" photoLabel={PHOTO} />
          </div>
        </SectionBlock>

        <SectionBlock id="about" number={4} title={c.about?.title} tone="violet">
          <div className={styles.aboutGrid}>
            <ContentTabs
              tabs={[
                {
                  label: c.about?.historyTitle,
                  content: (
                    <AboutBlock
                      image={c.about?.historyImage}
                      title={c.about?.historyTitle}
                      text={c.about?.history}
                      photoLabel={PHOTO}
                    />
                  ),
                },
                {
                  label: c.about?.infoTitle,
                  content: (
                    <AboutBlock
                      image={c.about?.infoImage}
                      title={c.about?.infoTitle}
                      text={c.about?.info}
                      photoLabel={PHOTO}
                    />
                  ),
                },
              ]}
            />
            <LatestPosts title={c.about?.latestTitle} posts={c.about?.latest} photoLabel={PHOTO} />
          </div>
        </SectionBlock>

        <SectionBlock id="notices" number={5} title={c.notices?.title} tone="pink">
          <CardCarousel>
            {c.notices?.items?.map((item, index) => (
              <InfoCard
                key={index}
                image={item.image}
                title={item.title}
                lines={[item.date, item.place]}
                photoLabel={PHOTO}
              />
            ))}
          </CardCarousel>
        </SectionBlock>

        <SectionBlock id="announcements" number={6} title={c.announcements?.title} tone="cream">
          <CardGrid minWidth={200}>
            {c.announcements?.items?.map((item, index) => (
              <InfoCard
                key={index}
                image={item.image}
                title={item.title}
                lines={[item.date, item.place]}
                photoLabel={PHOTO}
              />
            ))}
          </CardGrid>
        </SectionBlock>

        <SectionBlock id="gallery" number={7} title={c.gallery?.title} tone="green">
          <CardGrid minWidth={180}>
            {c.gallery?.images?.map((item, index) => (
              <InfoCard key={index} image={item.image} title={item.caption} photoLabel={PHOTO} />
            ))}
          </CardGrid>
        </SectionBlock>

        <SectionBlock id="contact" number={8} title={c.contact?.title} tone="blue">
          <ContactBlock address={c.contact?.address} phone={c.contact?.phone} email={c.contact?.email} />
        </SectionBlock>
      </main>
      <SiteFooter title={c.village?.name} text={c.footer?.text} menu={[...(c.menu?.items ?? []), ...extraMenu]} />
    </div>
  )
}

export default PanchayatClassicLayout
