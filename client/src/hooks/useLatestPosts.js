import { useEffect, useState } from 'react'
import { getPublicBlog, listBlogPosts } from '../services/api.js'

// Enough to fill the home page's Posts tabs; the public blog allows at most 20 per request.
const COUNT = 20

// The newest published posts for a home page. With a siteId it uses the admin API (previews);
// without one it uses the public API, which works out the site from the address.
// Errors just leave the list empty, so a blog problem never breaks the home page.
export function useLatestPosts(siteId) {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const load = siteId
      ? listBlogPosts(siteId, { status: 'published', limit: COUNT })
      : getPublicBlog(1, COUNT)
    load.then((result) => setPosts(result.posts)).catch(() => setPosts([]))
  }, [siteId])

  return posts
}
