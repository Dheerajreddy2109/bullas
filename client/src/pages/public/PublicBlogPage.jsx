import { useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../../components/Breadcrumbs.jsx'
import BlogCategoryTabs from '../../components/blog/BlogCategoryTabs.jsx'
import BlogList from '../../components/sections/BlogList.jsx'
import SiteShell from '../../components/sections/SiteShell.jsx'
import Pagination from '../../components/Pagination.jsx'
import { useLanguage } from '../../hooks/useLanguage.js'
import { getPublicBlog } from '../../services/api.js'
import { lookFor } from '../../templates/templateStyles.js'
import { POST_CATEGORIES } from '../../components/blog/postCategories.js'
import styles from '../../css/public/PublicBlogPage.module.css'

function PublicBlogPage() {
  const { site } = useOutletContext()
  // The page lives in the address, so visitors can share or bookmark page 2.
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  // From the home page's "View all" links; an unknown value is ignored rather than shown as an error.
  const category = POST_CATEGORIES.find((item) => item.value === searchParams.get('category'))
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const { language, labels } = useLanguage()
  const look = lookFor(language)
  const categoryLabel = category && labels[`cat_${category.value}`]

  useEffect(() => {
    // A slow answer for an earlier tab or language must not replace the current one.
    let current = true
    getPublicBlog(page, 10, category?.value, language)
      .then((data) => current && setResult(data))
      .catch((err) => current && setError(err.message))
    return () => {
      current = false
    }
  }, [page, category?.value, language])

  return (
    <SiteShell site={site}>
      <Breadcrumbs
        look="site"
        homeLabel={look.homeLabel}
        items={[
          { label: look.homeLabel, to: '/' },
          { label: look.blogLabel, to: category ? '/blog' : undefined },
          category && { label: categoryLabel },
        ]}
      />
      <h2 className={styles.heading}>{category ? categoryLabel : look.blogHeading}</h2>
      <BlogCategoryTabs blogHref="/blog" active={category?.value} />
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
            onChange={(next) => setSearchParams({ page: String(next), ...(category && { category: category.value }) })}
          />
        </>
      )}
    </SiteShell>
  )
}

export default PublicBlogPage
