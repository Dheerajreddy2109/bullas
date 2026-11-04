import { Link } from 'react-router-dom'
import SmartImage from '../sections/SmartImage.jsx'
import { useLanguage } from '../../hooks/useLanguage.js'
import { postDate } from './postDate.js'
import styles from '../../css/portal/PostCard.module.css'

// A blog post as a card: picture, date, title and a two-line summary. The whole card is the link.
function PostCard({ post, href }) {
  const { language } = useLanguage()
  return (
    <Link className={styles.card} to={href}>
      <SmartImage className={styles.image} src={post.image} alt="" />
      <div className={styles.body}>
        {post.publishedAt && <span className={styles.date}>{postDate(post, language)}</span>}
        <h4 className={styles.title}>{post.title}</h4>
        {post.description && <p className={styles.text}>{post.description}</p>}
      </div>
    </Link>
  )
}

export default PostCard
