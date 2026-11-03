import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BlogList from '../components/sections/BlogList.jsx'
import BlogPostView from '../components/sections/BlogPostView.jsx'
import SiteShell from '../components/sections/SiteShell.jsx'
import Pagination from '../components/Pagination.jsx'
import { getBlogPost, getSiteContent, listBlogPosts } from '../services/api.js'
import { lookFor } from '../templates/templateStyles.js'
import styles from '../css/BlogPreviewPage.module.css'

function BlogPreviewPage() {
  const { id, postId } = useParams()
  const [site, setSite] = useState(null)
  const [result, setResult] = useState(null)
  const [post, setPost] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    getSiteContent(id)
      .then(setSite)
      .catch((err) => setError(err.message))
  }, [id])

  useEffect(() => {
    // Only published posts, so the preview shows what visitors would see.
    const load = postId
      ? getBlogPost(id, postId).then(setPost)
      : listBlogPosts(id, { page, status: 'published' }).then(setResult)
    load.catch((err) => setError(err.message))
  }, [id, postId, page])

  if (error) return <p role="alert">Could not load the blog: {error}</p>
  if (!site) return <p>Loading...</p>

  const look = lookFor(site.templateSlug)
  const listHref = `/sites/${id}/blog/preview`

  return (
    <>
      <div className={styles.bar}>
        <Link className={styles.barLink} to={`/sites/${id}/blog`}>
          Back to posts
        </Link>
        <Link className={styles.barLink} to={`/sites/${id}/preview`}>
          Full site
        </Link>
        <span>Blog preview: {site.name}. Only published posts are shown.</span>
      </div>
      <SiteShell site={site} homeHref={`/sites/${id}/preview`} blogHref={listHref}>
        {postId ? (
          post && <BlogPostView post={post} backHref={listHref} backLabel={look.backLabel} />
        ) : (
          <>
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
