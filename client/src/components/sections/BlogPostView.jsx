import { Link } from 'react-router-dom'
import SmartImage from './SmartImage.jsx'
import styles from '../../css/sections/BlogPostView.module.css'

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '')

function BlogPostView({ post, backHref, backLabel = 'Back to blog' }) {
  return (
    <article className={styles.post}>
      <Link className={styles.back} to={backHref}>
        {backLabel}
      </Link>
      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.date}>{formatDate(post.publishedAt)}</p>
      {post.image && <SmartImage className={styles.image} src={post.image} alt={post.title} />}
      {/* Safe only because the server cleans every body with an allow-list before saving it. */}
      <div className={styles.body} dangerouslySetInnerHTML={{ __html: post.body }} />
    </article>
  )
}

export default BlogPostView
