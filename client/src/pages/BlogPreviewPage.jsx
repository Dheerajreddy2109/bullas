import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import BlogList from '../components/sections/BlogList.jsx'
import BlogPostView from '../components/sections/BlogPostView.jsx'
import SiteShell from '../components/sections/SiteShell.jsx'
import Pagination from '../components/Pagination.jsx'
import { getBlogPost, getSiteContent, listBlogPosts } from '../services/api.js'
import { lookFor } from '../templates/templateStyles.js'
import { POST_CATEGORIES } from '../components/blog/postCategories.js'
import styles from '../css/BlogPreviewPage.module.css'

function BlogPreviewPage() {
  const { id, postId } = useParams()
  const [site, setSite] = useState(null)
  const [result, setResult] = useState(null)
  const [post, setPost] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const category = POST_CATEGORIES.find((item) => item.value === searchParams.get('category'))

  useEffect(() => {
    getSiteContent(id)
      .then(setSite)
      .catch((err) => setError(err.message))
  }, [id])

  useEffect(() => {
    // Only published posts, so the preview shows what visitors would see.
    const load = postId
      ? getBlogPost(id, postId).then(setPost)
      : listBlogPosts(id, { page, status: 'published', category: category?.value }).then(setResult)
    load.catch((err) => setError(err.message))
  }, [id, postId, page, category?.value])

  if (error) return <p role="alert">Could not load the blog: {error}</p>
  if (!site) return <p>Loading...</p>

  const look = lookFor(site.templateSlug)
  const listHref = `/sites/${id}/blog/preview`

  return (
    <>
      <div className={styles.bar}>
        <Breadcrumbs
          look="light"
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Sites', to: '/sites' },
            { label: site.name, to: `/sites/${id}/edit` },
            { label: 'Blog', to: `/sites/${id}/blog` },
            { label: 'Preview' },
          ]}
        />
        <div className={styles.actions}>
          <span className={styles.status}>Only published posts are shown</span>
          <Link className={styles.barLink} to={`/sites/${id}/preview`}>
            Full site
          </Link>
        </div>
      </div>
      <SiteShell site={site} homeHref={`/sites/${id}/preview`} blogHref={listHref}>
        {postId ? (
          post && (
            <BlogPostView
              post={post}
              breadcrumbs={
                <Breadcrumbs
                  look="site"
                  homeLabel={look.homeLabel}
                  items={[
                    { label: look.homeLabel, to: `/sites/${id}/preview` },
                    { label: look.blogLabel, to: listHref },
                    { label: post.title },
                  ]}
                />
              }
            />
          )
        ) : (
          <>
            <Breadcrumbs
              look="site"
              homeLabel={look.homeLabel}
              items={[{ label: look.homeLabel, to: `/sites/${id}/preview` }, { label: look.blogLabel }]}
            />
            <h2 className={styles.heading}>{look.blogHeading}</h2>
            {result && (
              <>
                <BlogList
                  posts={result.posts}
                  postHref={(item) => `${listHref}/${item._id}`}
                  emptyText={look.emptyText}
                />
                <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />
              </>
            )}
          </>
        )}
      </SiteShell>
    </>
  )
}

export default BlogPreviewPage
