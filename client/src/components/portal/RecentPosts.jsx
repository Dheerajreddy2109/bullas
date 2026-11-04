import { FaRegCalendarDays } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import SmartImage from '../sections/SmartImage.jsx'
import { postDate } from './postDate.js'
import styles from '../../css/portal/RecentPosts.module.css'

// The "Recent posts" box beside the tabs: the newest posts from every category.
function RecentPosts({ title, posts = [], postHref, blogHref, viewAllLabel, emptyText }) {
  return (
    <aside className={styles.box}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {posts.length > 0 && (
          <Link className={styles.viewAll} to={blogHref}>
            {viewAllLabel}
          </Link>
        )}
      </div>
      {posts.length === 0 && <p className={styles.empty}>{emptyText}</p>}
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.slug ?? post._id}>
            <Link className={styles.item} to={postHref(post)}>
              <SmartImage className={styles.thumb} src={post.image} alt="" />
              <span className={styles.text}>
                <span className={styles.postTitle}>{post.title}</span>
                {post.publishedAt && <span className={styles.date}><FaRegCalendarDays aria-hidden="true" /> {postDate(post)}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default RecentPosts
