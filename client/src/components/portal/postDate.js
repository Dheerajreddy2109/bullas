import { formatDate } from '../../templates/labels.js'

// A post's publish date in the chosen language, or nothing for a post without one.
export const postDate = (post, language) => (post?.publishedAt ? formatDate(new Date(post.publishedAt), language) : '')
