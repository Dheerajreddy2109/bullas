import { Link } from 'react-router-dom'
import SmartImage from './SmartImage.jsx'
import { useLanguage } from '../../hooks/useLanguage.js'
import { postDate } from '../portal/postDate.js'
import styles from '../../css/sections/BlogList.module.css'

// postHref is a prop, so the admin preview and the real site can use different addresses.
function BlogList({ posts, postHref, emptyText = 'No posts yet.' }) {
  const { language } = useLanguage()
  if (posts.length === 0) return <p className={styles.empty}>{emptyText}</p>

  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <Link key={post._id ?? post.slug} className={styles.card} to={postHref(post)}>
          <SmartImage className={styles.image} src={post.image} alt={post.title} />
          <div className={styles.body}>
            <p className={styles.date}>{postDate(post, language)}</p>
            <h3 className={styles.title}>{post.title}</h3>
            {post.description && <p className={styles.description}>{post.description}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default BlogList
