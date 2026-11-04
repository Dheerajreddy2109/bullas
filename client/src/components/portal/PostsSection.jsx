import { Link } from 'react-router-dom'
import { POST_CATEGORIES } from '../blog/postCategories.js'
import ContentTabs from '../sections/ContentTabs.jsx'
import SectionBlock from '../sections/SectionBlock.jsx'
import PostCard from './PostCard.jsx'
import RecentPosts from './RecentPosts.jsx'
import styles from '../../css/portal/PostsSection.module.css'

const PER_TAB = 6
const RECENT = 4
// Posts saved before categories existed come back as daily updates.
const inCategory = (posts, value) => posts.filter((post) => (post.category ?? 'daily') === value)

// The Posts section: one tab per blog category, with the newest posts listed beside them.
// Tabs show only real blog posts, so a new site has no sample boxes to clear away.
// about holds the section's headings, which the owner can edit.
function PostsSection({ number, about = {}, posts = [], postHref, blogHref, look }) {
  function postGrid(value) {
    const items = inCategory(posts, value)
    if (items.length === 0) return null
    return (
      <>
        <div className={styles.grid}>
          {items.slice(0, PER_TAB).map((post) => (
            <PostCard key={post.slug ?? post._id} post={post} href={postHref(post)} />
          ))}
        </div>
        {items.length > PER_TAB && (
          <Link className={styles.more} to={`${blogHref}?category=${value}`}>
            {look.viewAllLabel}
          </Link>
        )}
      </>
    )
  }

  const tabs = POST_CATEGORIES.map((category) => ({
    label: category.telugu,
    content: postGrid(category.value) ?? <p className={styles.empty}>{look.emptyText}</p>,
  }))

  // Open on the first tab that has posts, so visitors don't land on an empty one.
  const firstWithPosts = POST_CATEGORIES.findIndex((category) => inCategory(posts, category.value).length > 0)

  return (
    <SectionBlock id="posts" number={number} title={about.title} tone="violet">
      {/* Older menus link to #about and #gallery, so those addresses still land here. */}
      <span id="about" className={styles.anchor} />
      <span id="gallery" className={styles.anchor} />
      <div className={styles.layout}>
        <ContentTabs tabs={tabs} preferredIndex={Math.max(firstWithPosts, 0)} />
        <RecentPosts
          title={about.recentTitle}
          posts={posts.slice(0, RECENT)}
          postHref={postHref}
          blogHref={blogHref}
          viewAllLabel={look.viewAllLabel}
          emptyText={look.emptyText}
        />
      </div>
    </SectionBlock>
  )
}

export default PostsSection
