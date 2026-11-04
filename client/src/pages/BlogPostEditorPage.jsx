import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import BlogPostForm from '../components/blog/BlogPostForm.jsx'
import ScopeLink from '../components/ScopeLink.jsx'
import { useSiteName } from '../hooks/useSiteName.js'
import { useSiteScope } from '../hooks/useSiteScope.js'
import { getBlogPost } from '../services/api.js'
import styles from '../css/BlogPostEditorPage.module.css'

function BlogPostEditorPage() {
  const scope = useSiteScope()
  const id = scope.siteId
  const { postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const siteName = useSiteName(scope.needsSiteName ? id : null)

  useEffect(() => {
    if (!postId) return
    getBlogPost(id, postId)
      .then(setPost)
      .catch((err) => setError(err.message))
  }, [id, postId])

  function handleSaved(savedPost) {
    setSaved(true)
    // A new post moves to its own edit address, so refreshing doesn't create it twice.
    if (!postId) {
      navigate(`${scope.base}/blog/${savedPost._id}/edit`, { replace: true })
      return
    }
    setPost(savedPost)
  }

  if (error) return <p role="alert">Could not load this post: {error}</p>
  if (postId && !post) return <p>Loading...</p>

  return (
    <>
      <Breadcrumbs
        items={[
          ...scope.siteCrumbs(siteName),
          { label: 'Blog', to: `${scope.base}/blog` },
          { label: post ? post.title : 'New post' },
        ]}
      />
      <div className={styles.header}>
        <h1 className={styles.title}>{post ? 'Edit post' : 'New post'}</h1>
        {saved && (
          <span className={styles.saved}>
            Saved.{' '}
            {post?.status === 'published' ? (
              <ScopeLink
                to={scope.previewIsExternal ? `/blog/${encodeURIComponent(post.slug)}` : `${scope.blogPreviewHref}/${post._id}`}
              >
                View post
              </ScopeLink>
            ) : (
              'It stays hidden from visitors until you publish it.'
            )}
          </span>
        )}
      </div>
      {/* The key resets the form when a different post loads. */}
      <BlogPostForm key={post?._id ?? 'new'} siteId={id} post={post} onSaved={handleSaved} />
    </>
  )
}

export default BlogPostEditorPage
