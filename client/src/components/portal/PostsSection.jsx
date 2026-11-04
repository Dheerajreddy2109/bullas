import { Link } from 'react-router-dom'
import { POST_CATEGORIES } from '../blog/postCategories.js'
import ContentTabs from '../sections/ContentTabs.jsx'
import SectionBlock from '../sections/SectionBlock.jsx'
import HistoryFeature from './HistoryFeature.jsx'
import PhotoGrid from './PhotoGrid.jsx'
import PostCard from './PostCard.jsx'
import RecentPosts from './RecentPosts.jsx'
import styles from '../../css/portal/PostsSection.module.css'

const PER_TAB = 6
const RECENT = 4
const tabLabel = (value) => POST_CATEGORIES.find((item) => item.value === value).telugu
// Posts saved before categories existed come back as daily updates.
const inCategory = (posts, value) => posts.filter((post) => (post.category ?? 'daily') === value)

// The Posts section: tabs for each kind of post, with the newest posts listed beside them.
// about holds the history text the owner writes in Edit website; posts come from the blog.
function PostsSection({ number, about = {}, gallery = {}, posts = [], postHref, blogHref, look }) {
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

  const empty = <p className={styles.empty}>{look.emptyText}</p>

  const tabs = [
    {
      label: tabLabel('history'),
      content: (
        <div className={styles.stack}>
          <HistoryFeature title={about.historyTitle} text={about.history} image={about.historyImage} />
          {about.info && <HistoryFeature title={about.infoTitle} text={about.info} image={about.infoImage} />}
          {postGrid('history')}
        </div>
      ),
    },
    { label: tabLabel('daily'), content: postGrid('daily') ?? empty },
    { label: tabLabel('announcement'), content: postGrid('announcement') ?? empty },
    {
      label: gallery.title || tabLabel('gallery'),
      content: (
        <div className={styles.stack}>
          <PhotoGrid photos={gallery.images} />
          {postGrid('gallery')}
        </div>
      ),
    },
  ]

  return (
    <SectionBlock id="posts" number={number} title={about.title} tone="violet">
      {/* Older menus link to #about and #gallery, so those addresses still land here. */}
      <span id="about" className={styles.anchor} />
      <span id="gallery" className={styles.anchor} />
      <div className={styles.layout}>
        <ContentTabs tabs={tabs} />
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
