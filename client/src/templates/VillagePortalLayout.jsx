import AnnouncementsSection from '../components/portal/AnnouncementsSection.jsx'
import EventsSection from '../components/portal/EventsSection.jsx'
import MembersSection from '../components/portal/MembersSection.jsx'
import SchemeColumn from '../components/portal/SchemeColumn.jsx'
import PostsSection from '../components/portal/PostsSection.jsx'
import PortalFooter from '../components/portal/PortalFooter.jsx'
import PortalBanner from '../components/portal/PortalBanner.jsx'
import PortalTopBar from '../components/portal/PortalTopBar.jsx'
import ContactBlock from '../components/sections/ContactBlock.jsx'
import Container from '../components/sections/Container.jsx'
import SectionBlock from '../components/sections/SectionBlock.jsx'
import { readContent, safeColor } from './contentHelpers.js'
import { lookFor } from './templateStyles.js'
import { themeFor } from './themes.js'
import styles from '../css/VillagePortalLayout.module.css'

// latestPosts come from the real blog; the links are props because the admin previews use other addresses.
const defaultPostHref = (post) => `/blog/${encodeURIComponent(post.slug)}`

// The one layout every template shares; templateSlug only changes its theme (see themes.js).
// extraMenu lets the live site add links, like Blog, that aren't part of the saved content.
function VillagePortalLayout({
  content,
  templateSlug = 'panchayat-classic',
  extraMenu = [],
  latestPosts = [],
  blogHref = '/blog',
  postHref = defaultPostHref,
}) {
  const look = lookFor(templateSlug)
  const theme = themeFor(templateSlug)
  const c = readContent(content)
  const brand = safeColor(c.branding?.brandColor, '#0b6b3a')
  // The sections in page order; numbers come from this list, so a hidden section never leaves a gap.
  const order = [
    'members',
    'schemes',
    'posts',
    // A site with no events shows no empty box, and the numbers close up.
    c.events?.items?.length > 0 && 'events',
    c.announcements?.items?.length > 0 && 'announcements',
    'contact',
  ].filter(Boolean)
  const numberOf = (id) => order.indexOf(id) + 1

  return (
    <div className={styles.site} data-look={theme.look} style={{ ...theme.vars, '--brand': brand }}>
      <PortalTopBar
        state={c.topBar?.state}
        district={c.topBar?.district}
        mandal={c.topBar?.mandal}
        village={c.topBar?.village}
        social={c.topBar?.social}
      />
      <PortalBanner village={c.village} logo={c.branding?.logo} menu={[...(c.menu?.items ?? []), ...extraMenu]} />
      <Container className={styles.sections}>
        <MembersSection number={numberOf('members')} title={c.members?.title} people={c.members?.people} />

        <SectionBlock id="schemes" number={numberOf('schemes')} title={c.schemes?.title} tone="blue">
          <div className={styles.twoPanels}>
            <SchemeColumn
              title={c.schemes?.centralTitle}
              tone="a"
              leader={{ photo: c.schemes?.centralLeaderPhoto, name: c.schemes?.centralLeaderName, title: c.schemes?.centralLeaderTitle }}
              schemes={c.schemes?.central}
              viewAllLabel="అన్ని కేంద్ర పథకాలు"
            />
            <SchemeColumn
              title={c.schemes?.stateTitle}
              tone="b"
              leader={{ photo: c.schemes?.stateLeaderPhoto, name: c.schemes?.stateLeaderName, title: c.schemes?.stateLeaderTitle }}
              schemes={c.schemes?.state}
              viewAllLabel="అన్ని రాష్ట్ర పథకాలు"
            />
          </div>
        </SectionBlock>

        <PostsSection
          number={numberOf('posts')}
          about={c.about}
          gallery={c.gallery}
          posts={latestPosts}
          postHref={postHref}
          blogHref={blogHref}
          look={look}
        />

        <EventsSection number={numberOf('events')} title={c.events?.title} events={c.events?.items} />

        <AnnouncementsSection
          number={numberOf('announcements')}
          title={c.announcements?.title}
          subtitle={c.announcements?.subtitle}
          items={c.announcements?.items}
        />

        <SectionBlock id="contact" number={numberOf('contact')} title={c.contact?.title} tone="blue">
          <ContactBlock address={c.contact?.address} phone={c.contact?.phone} email={c.contact?.email} />
        </SectionBlock>
      </Container>
      <PortalFooter
        villageName={c.village?.name}
        footer={c.footer}
        logo={c.branding?.logo}
        menu={[...(c.menu?.items ?? []), ...extraMenu]}
        social={c.topBar?.social}
      />
    </div>
  )
}

export default VillagePortalLayout
