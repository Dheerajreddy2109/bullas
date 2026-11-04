import { useOutletContext } from 'react-router-dom'
import SiteNotFound from '../../components/SiteNotFound.jsx'
import { useLanguage } from '../../hooks/useLanguage.js'
import { useLatestPosts } from '../../hooks/useLatestPosts.js'
import { templateLayouts } from '../../templates/registry.js'

function PublicHomePage() {
  const { site } = useOutletContext()
  const { language, labels } = useLanguage()
  const latestPosts = useLatestPosts(null, language)
  const Layout = templateLayouts[site.templateSlug]

  if (!Layout) return <SiteNotFound title="This site is being set up" message="Please check back soon." />

  return (
    <Layout
      content={site.content}
      extraMenu={[{ label: labels.blog, href: '/blog' }]}
      latestPosts={latestPosts}
    />
  )
}

export default PublicHomePage
