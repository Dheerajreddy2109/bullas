import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import OwnerSiteScope from '../components/OwnerSiteScope.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import PublicSiteLayout from '../components/PublicSiteLayout.jsx'
import SiteNotFound from '../components/SiteNotFound.jsx'
import AuthProvider from '../context/AuthProvider.jsx'
import BlogPostEditorPage from '../pages/BlogPostEditorPage.jsx'
import BlogPostsPage from '../pages/BlogPostsPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import ChangePasswordPage from '../pages/owner/ChangePasswordPage.jsx'
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage.jsx'
import PublicBlogPage from '../pages/public/PublicBlogPage.jsx'
import PublicHomePage from '../pages/public/PublicHomePage.jsx'
import PublicPostPage from '../pages/public/PublicPostPage.jsx'
import SiteEditorPage from '../pages/SiteEditorPage.jsx'

// Only things the owner can do; there's no sites list or templates here at all.
const OWNER_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/content', label: 'Edit website' },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/change-password', label: 'Change password' },
  { to: '/', label: 'View website', external: true },
]

// Only the admin pages ask "who is logged in", so public visitors never trigger that request.
function OwnerAuth() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

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

        <Route element={<OwnerAuth />}>
          <Route path="/admin/login" element={<LoginPage title="Website admin" homePath="/admin" />} />
          <Route
            element={
              <ProtectedRoute
                role="siteowner"
                loginPath="/admin/login"
                changePasswordPath="/admin/change-password"
              />
            }
          >
            <Route element={<DashboardLayout brand="Website admin" links={OWNER_LINKS} />}>
              <Route path="/admin/change-password" element={<ChangePasswordPage />} />
              <Route element={<OwnerSiteScope />}>
                <Route path="/admin" element={<OwnerDashboardPage />} />
                <Route path="/admin/content" element={<SiteEditorPage />} />
                <Route path="/admin/blog" element={<BlogPostsPage />} />
                <Route path="/admin/blog/new" element={<BlogPostEditorPage />} />
                <Route path="/admin/blog/:postId/edit" element={<BlogPostEditorPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<SiteNotFound title="Page not found" message="This page doesn't exist." />} />
      </Routes>
    </BrowserRouter>
  )
}

export default SiteApp
