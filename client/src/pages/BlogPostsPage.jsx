import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BlogPostsTable from '../components/blog/BlogPostsTable.jsx'
import Pagination from '../components/Pagination.jsx'
import ScopeLink from '../components/ScopeLink.jsx'
import { useSiteScope } from '../hooks/useSiteScope.js'
import { deleteBlogPost, getSiteContent, listBlogPosts, setBlogPostStatus } from '../services/api.js'
import styles from '../css/BlogPostsPage.module.css'

function BlogPostsPage() {
  const scope = useSiteScope()
  const id = scope.siteId
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
      <Link className={styles.back} to={scope.backHref}>
        {scope.backLabel}
      </Link>
      <div className={styles.header}>
        <h1 className={styles.title}>Blog{siteName && `: ${siteName}`}</h1>
        <div className={styles.links}>
          <ScopeLink className={styles.secondary} to={scope.previewHref} external={scope.previewIsExternal}>
            Preview site
          </ScopeLink>
          <ScopeLink className={styles.secondary} to={scope.blogPreviewHref} external={scope.previewIsExternal}>
            Preview blog
          </ScopeLink>
          <Link className={styles.primary} to={`${scope.base}/blog/new`}>
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
            editBase={`${scope.base}/blog`}
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
