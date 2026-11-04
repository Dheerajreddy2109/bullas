import { Link } from 'react-router-dom'
import { POST_CATEGORIES } from './postCategories.js'
import styles from '../../css/blog/BlogCategoryTabs.module.css'

// The blog page's category tabs. They are links, not buttons, so a visitor can share or bookmark
// one category, and the browser's back button returns to the previous tab.
// active is the chosen category's value, or empty for all posts.
function BlogCategoryTabs({ blogHref, active = '' }) {
  const tabs = [{ value: '', telugu: 'అన్నీ' }, ...POST_CATEGORIES]

  return (
    <nav className={styles.tabs} aria-label="పోస్టుల వర్గాలు">
      {tabs.map((tab) => (
        <Link
          key={tab.value || 'all'}
          className={`${styles.tab} ${active === tab.value ? styles.active : ''}`}
          to={tab.value ? `${blogHref}?category=${tab.value}` : blogHref}
          aria-current={active === tab.value ? 'page' : undefined}
        >
          {tab.telugu}
        </Link>
      ))}
    </nav>
  )
}

export default BlogCategoryTabs
