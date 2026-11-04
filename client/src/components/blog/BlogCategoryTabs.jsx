import { Link } from 'react-router-dom'
import { POST_CATEGORIES } from './postCategories.js'
import { useLanguage } from '../../hooks/useLanguage.js'
import styles from '../../css/blog/BlogCategoryTabs.module.css'

// The blog page's category tabs. They are links, not buttons, so a visitor can share or bookmark
// one category, and the browser's back button returns to the previous tab.
// active is the chosen category's value, or empty for all posts.
function BlogCategoryTabs({ blogHref, active = '' }) {
  const { labels } = useLanguage()
  const tabs = [{ value: '', label: labels.all }, ...POST_CATEGORIES.map((item) => ({ value: item.value, label: labels[`cat_${item.value}`] }))]

  return (
    <nav className={styles.tabs} aria-label={labels.chooseCategory}>
      {tabs.map((tab) => (
        <Link
          key={tab.value || 'all'}
          className={`${styles.tab} ${active === tab.value ? styles.active : ''}`}
          to={tab.value ? `${blogHref}?category=${tab.value}` : blogHref}
          aria-current={active === tab.value ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}

export default BlogCategoryTabs
