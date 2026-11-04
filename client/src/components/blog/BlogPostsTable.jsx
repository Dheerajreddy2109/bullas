import { useState } from 'react'
import { Link } from 'react-router-dom'
import ScopeLink from '../ScopeLink.jsx'
import { categoryOf } from './postCategories.js'
import SmartImage from '../sections/SmartImage.jsx'
import styles from '../../css/blog/BlogPostsTable.module.css'

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-')

// previewHref gives a post's preview address, or null when it can't be previewed yet.
function BlogPostsTable({ editBase, posts, busyId, onToggleStatus, onDelete, previewHref }) {
  // An in-page confirm rather than a browser pop-up, which can't be styled or tested easily.
  const [confirmId, setConfirmId] = useState(null)

  return (
    // Scrolls inside its own box, so a wide table can't push a phone screen sideways.
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Post</th>
            <th>Status</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id}>
              <td>
                <div className={styles.post}>
                  <div className={styles.thumb}>
                    <SmartImage src={post.image} alt="" />
                  </div>
                  <div className={styles.text}>
                    <span className={styles.title}>{post.title}</span>
                    <span className={`${styles.category} ${styles[categoryOf(post).value]}`}>
                      {categoryOf(post).label}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className={`${styles.status} ${styles[post.status]}`}>{post.status}</span>
              </td>
              <td>{formatDate(post.publishedAt)}</td>
              <td className={styles.actions}>
                <Link className={styles.button} to={`${editBase}/${post._id}/edit`}>
                  Edit
                </Link>
                {previewHref(post) ? (
                  <ScopeLink className={styles.button} to={previewHref(post)}>
                    Preview
                  </ScopeLink>
                ) : (
                  // Visitors can't see a draft, so there is nothing to open until it's published.
                  <span className={`${styles.button} ${styles.disabled}`} title="Publish the post to preview it">
                    Preview
                  </span>
                )}
                <button
                  className={styles.button}
                  type="button"
                  disabled={busyId === post._id}
                  onClick={() => onToggleStatus(post)}
                >
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                {confirmId === post._id ? (
                  <>
                    <span>Delete?</span>
                    <button
                      className={`${styles.button} ${styles.danger}`}
                      type="button"
                      disabled={busyId === post._id}
                      onClick={() => onDelete(post)}
                    >
                      Yes
                    </button>
                    <button className={styles.button} type="button" onClick={() => setConfirmId(null)}>
                      No
                    </button>
                  </>
                ) : (
                  <button className={styles.button} type="button" onClick={() => setConfirmId(post._id)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BlogPostsTable
