const FORMAT = new Intl.DateTimeFormat('te-IN', { day: 'numeric', month: 'long', year: 'numeric' })

// A post's publish date in Telugu, or nothing for a post without one.
export const postDate = (post) => (post?.publishedAt ? FORMAT.format(new Date(post.publishedAt)) : '')
