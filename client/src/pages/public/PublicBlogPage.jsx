import { useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import BlogList from '../../components/sections/BlogList.jsx'
import SiteShell from '../../components/sections/SiteShell.jsx'
import Pagination from '../../components/Pagination.jsx'
import { getPublicBlog } from '../../services/api.js'
import { lookFor } from '../../templates/templateStyles.js'
import styles from '../../css/public/PublicBlogPage.module.css'

function PublicBlogPage() {
  const { site } = useOutletContext()
  // The page lives in the address, so visitors can share or bookmark page 2.
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const look = lookFor(site.templateSlug)

  useEffect(() => {
    getPublicBlog(page)
      .then(setResult)
      .catch((err) => setError(err.message))
  }, [page])

  return (
    <SiteShell site={site}>
      <h2 className={styles.heading}>{look.blogHeading}</h2>
      {error && <p role="alert">{error}</p>}
      {result && (
        <>
          <BlogList
            posts={result.posts}
            postHref={(post) => `/blog/${encodeURIComponent(post.slug)}`}
            emptyText={look.emptyText}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={(next) => setSearchParams({ page: String(next) })}
          />
        </>
      )}
    </SiteShell>
  )
}

export default PublicBlogPage
