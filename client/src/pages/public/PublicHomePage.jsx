import { useOutletContext } from 'react-router-dom'
import SiteNotFound from '../../components/SiteNotFound.jsx'
import { templateLayouts } from '../../templates/registry.js'
import { lookFor } from '../../templates/templateStyles.js'

function PublicHomePage() {
  const { site } = useOutletContext()
  const Layout = templateLayouts[site.templateSlug]

  if (!Layout) return <SiteNotFound title="This site is being set up" message="Please check back soon." />

  return <Layout content={site.content} extraMenu={[{ label: lookFor(site.templateSlug).blogLabel, href: '/blog' }]} />
}

export default PublicHomePage
