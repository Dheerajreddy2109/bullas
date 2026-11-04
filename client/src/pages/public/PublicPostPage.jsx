import { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs.jsx'
import BlogPostView from '../../components/sections/BlogPostView.jsx'
import SiteShell from '../../components/sections/SiteShell.jsx'
import { useLanguage } from '../../hooks/useLanguage.js'
import { getPublicPost } from '../../services/api.js'
import { lookFor } from '../../templates/templateStyles.js'

function PublicPostPage() {
  const { site } = useOutletContext()
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)
  const { language, labels } = useLanguage()
  const look = lookFor(language)

  useEffect(() => {
    let current = true
    getPublicPost(slug, language)
      .then((data) => {
        if (!current) return
        setPost(data)
        document.title = `${data.title} | ${site.name}`
      })
      .catch((err) => current && setError(err))
    return () => {
      current = false
    }
  }, [slug, site.name, language])

  return (
    <SiteShell site={site}>
      {error?.status === 404 && <p>{labels.postMissing}</p>}
      {error && error.status !== 404 && <p role="alert">{error.message}</p>}
      {post && (
        <BlogPostView
          post={post}
          breadcrumbs={
            <Breadcrumbs
              look="site"
              homeLabel={look.homeLabel}
              items={[{ label: look.homeLabel, to: '/' }, { label: look.blogLabel, to: '/blog' }, { label: post.title }]}
            />
          }
        />
      )}
    </SiteShell>
  )
}

export default PublicPostPage
