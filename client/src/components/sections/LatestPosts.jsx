import SmartImage from './SmartImage.jsx'
import styles from '../../css/sections/LatestPosts.module.css'

// A compact list of recent posts, for a sidebar beside other content.
function LatestPosts({ title, posts = [] }) {
  return (
    <aside className={styles.box}>
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.list}>
        {posts.map((post, index) => (
          <li key={index} className={styles.post}>
            <div className={styles.media}>
              <SmartImage src={post.image} alt={post.title} />
            </div>
            <div className={styles.text}>
              <p className={styles.name}>{post.title}</p>
              {post.date && <p className={styles.date}>{post.date}</p>}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default LatestPosts
