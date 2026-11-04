import SmartImage from './SmartImage.jsx'
import { postDate } from '../portal/postDate.js'
import styles from '../../css/sections/BlogPostView.module.css'

// The page passes in its own breadcrumbs, because the trail differs on the live site and in previews.
function BlogPostView({ post, breadcrumbs }) {
  return (
    <article className={styles.post}>
      {breadcrumbs}
      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.date}>{postDate(post)}</p>
      {post.image && <SmartImage className={styles.image} src={post.image} alt={post.title} />}
      {/* Safe only because the server cleans every body with an allow-list before saving it. */}
      <div className={styles.body} dangerouslySetInnerHTML={{ __html: post.body }} />
    </article>
  )
}

export default BlogPostView
