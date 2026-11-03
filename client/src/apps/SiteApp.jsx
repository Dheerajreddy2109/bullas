import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicSiteLayout from '../components/PublicSiteLayout.jsx'
import SiteNotFound from '../components/SiteNotFound.jsx'
import PublicBlogPage from '../pages/public/PublicBlogPage.jsx'
import PublicHomePage from '../pages/public/PublicHomePage.jsx'
import PublicPostPage from '../pages/public/PublicPostPage.jsx'

// A customer's website, on its subdomain or custom domain. The server decides which site it is.
function SiteApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicSiteLayout />}>
          <Route index element={<PublicHomePage />} />
          <Route path="/blog" element={<PublicBlogPage />} />
          <Route path="/blog/:slug" element={<PublicPostPage />} />
        </Route>
        <Route path="*" element={<SiteNotFound title="Page not found" message="This page doesn't exist." />} />
      </Routes>
    </BrowserRouter>
  )
}

export default SiteApp
