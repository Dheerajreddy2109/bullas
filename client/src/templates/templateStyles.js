import { labelsFor } from './labels.js'

// The blog wording every template shares, in the language being shown.
export function lookFor(language) {
  const labels = labelsFor(language)
  return {
    homeLabel: labels.home,
    blogLabel: labels.blog,
    blogHeading: labels.blogHeading,
    emptyText: labels.empty,
    viewAllLabel: `${labels.viewAllPosts} →`,
  }
}
