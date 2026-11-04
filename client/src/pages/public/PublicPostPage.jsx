import { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs.jsx'
import BlogPostView from '../../components/sections/BlogPostView.jsx'
import SiteShell from '../../components/sections/SiteShell.jsx'
import { getPublicPost } from '../../services/api.js'
import { lookFor } from '../../templates/templateStyles.js'

function PublicPostPage() {
  const { site } = useOutletContext()
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)
  const look = lookFor(site.templateSlug)

  useEffect(() => {
    getPublicPost(slug)
      .then((data) => {
        setPost(data)
        document.title = `${data.title} | ${site.name}`
      })
      .catch(setError)
  }, [slug, site.name])

  return (
    <SiteShell site={site}>
      {error?.status === 404 && <p>This post doesn't exist or is no longer published.</p>}
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
