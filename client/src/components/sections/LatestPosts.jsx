import SmartImage from './SmartImage.jsx'
import styles from '../../css/sections/LatestPosts.module.css'

function LatestPosts({ title, posts = [], photoLabel }) {
  return (
    <aside className={styles.box}>
      <h3 className={styles.title}>{title}</h3>
      {posts.map((post, index) => (
        <div key={index} className={styles.post}>
          <SmartImage className={styles.image} src={post.image} alt={post.title} placeholder={photoLabel} />
          <div>
            <p className={styles.name}>{post.title}</p>
            <p className={styles.date}>{post.date}</p>
          </div>
        </div>
      ))}
    </aside>
  )
}

export default LatestPosts
