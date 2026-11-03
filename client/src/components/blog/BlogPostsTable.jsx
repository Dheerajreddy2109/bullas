import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '../../css/blog/BlogPostsTable.module.css'

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-')

function BlogPostsTable({ editBase, posts, busyId, onToggleStatus, onDelete }) {
  // An in-page confirm rather than a browser pop-up, which can't be styled or tested easily.
  const [confirmId, setConfirmId] = useState(null)

  return (
    // Scrolls inside its own box, so a wide table can't push a phone screen sideways.
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id}>
              <td className={styles.title}>{post.title}</td>
              <td>{post.slug}</td>
              <td>
                <span className={`${styles.status} ${styles[post.status]}`}>{post.status}</span>
              </td>
              <td>{formatDate(post.publishedAt)}</td>
              <td className={styles.actions}>
                <Link className={styles.button} to={`${editBase}/${post._id}/edit`}>
                  Edit
                </Link>
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
