import { Link } from 'react-router-dom'
import BlogList from './BlogList.jsx'
import SectionBlock from './SectionBlock.jsx'
import styles from '../../css/sections/LatestBlogPosts.module.css'

// The newest posts on the home page, so visitors see the blog without opening the menu.
// Renders nothing for a site with no published posts, so new sites don't show an empty box.
function LatestBlogPosts({ posts, heading, viewAllLabel, blogHref, postHref, number, tone }) {
  if (!posts?.length) return null

  return (
    <SectionBlock id="blog" number={number} title={heading} tone={tone}>
      <BlogList posts={posts} postHref={postHref} />
      <Link className={styles.viewAll} to={blogHref}>
        {viewAllLabel}
      </Link>
    </SectionBlock>
  )
}

export default LatestBlogPosts
