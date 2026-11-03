import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BlogPostForm from '../components/blog/BlogPostForm.jsx'
import { getBlogPost } from '../services/api.js'
import styles from '../css/BlogPostEditorPage.module.css'

function BlogPostEditorPage() {
  const { id, postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

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
      navigate(`/sites/${id}/blog/${savedPost._id}/edit`, { replace: true })
      return
    }
    setPost(savedPost)
  }

  if (error) return <p role="alert">Could not load this post: {error}</p>
  if (postId && !post) return <p>Loading...</p>

  return (
    <>
      <Link className={styles.back} to={`/sites/${id}/blog`}>
        Back to posts
      </Link>
      <div className={styles.header}>
        <h1 className={styles.title}>{post ? 'Edit post' : 'New post'}</h1>
        {saved && <span className={styles.saved}>Saved. The body was cleaned for safety.</span>}
      </div>
      {/* The key resets the form when a different post loads. */}
      <BlogPostForm key={post?._id ?? 'new'} siteId={id} post={post} onSaved={handleSaved} />
    </>
  )
}

export default BlogPostEditorPage
