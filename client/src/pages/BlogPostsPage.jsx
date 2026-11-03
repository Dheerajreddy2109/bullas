import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BlogPostsTable from '../components/blog/BlogPostsTable.jsx'
import Pagination from '../components/Pagination.jsx'
import { deleteBlogPost, getSiteContent, listBlogPosts, setBlogPostStatus } from '../services/api.js'
import styles from '../css/BlogPostsPage.module.css'

function BlogPostsPage() {
  const { id } = useParams()
  const [siteName, setSiteName] = useState('')
  const [result, setResult] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    getSiteContent(id)
      .then((site) => setSiteName(site.name))
      .catch((err) => setError(err.message))
  }, [id])

  useEffect(() => {
    listBlogPosts(id, { page })
      .then(setResult)
      .catch((err) => setError(err.message))
  }, [id, page])

  async function runAction(post, action) {
    setError('')
    setBusyId(post._id)
    try {
      await action()
      setResult(await listBlogPosts(id, { page }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const toggleStatus = (post) =>
    runAction(post, () =>
      setBlogPostStatus(id, post._id, post.status === 'published' ? 'draft' : 'published'),
    )
  const removePost = (post) => runAction(post, () => deleteBlogPost(id, post._id))

  return (
    <>
      <Link className={styles.back} to="/sites">
        Back to sites
      </Link>
      <div className={styles.header}>
        <h1 className={styles.title}>Blog{siteName && `: ${siteName}`}</h1>
        <div className={styles.links}>
          <Link className={styles.secondary} to={`/sites/${id}/preview`}>
            Preview site
          </Link>
          <Link className={styles.secondary} to={`/sites/${id}/blog/preview`}>
            Preview blog
          </Link>
          <Link className={styles.primary} to={`/sites/${id}/blog/new`}>
            New post
          </Link>
        </div>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!result && !error && <p>Loading...</p>}
      {result?.total === 0 && <p>No posts yet. Write the first one.</p>}
      {result?.total > 0 && (
        <>
          <BlogPostsTable
            siteId={id}
            posts={result.posts}
            busyId={busyId}
            onToggleStatus={toggleStatus}
            onDelete={removePost}
          />
          <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}
    </>
  )
}

export default BlogPostsPage
