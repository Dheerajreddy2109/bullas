import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminSiteScope from '../components/AdminSiteScope.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import AuthProvider from '../context/AuthProvider.jsx'
import BlogPostEditorPage from '../pages/BlogPostEditorPage.jsx'
import BlogPostsPage from '../pages/BlogPostsPage.jsx'
import BlogPreviewPage from '../pages/BlogPreviewPage.jsx'
import CreateSitePage from '../pages/CreateSitePage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import OwnerManagePage from '../pages/OwnerManagePage.jsx'
import SiteEditorPage from '../pages/SiteEditorPage.jsx'
import SitePreviewPage from '../pages/SitePreviewPage.jsx'
import SitesPage from '../pages/SitesPage.jsx'
import TemplatePreviewPage from '../pages/TemplatePreviewPage.jsx'
import TemplatesPage from '../pages/TemplatesPage.jsx'

// The super admin area, served only on admin.<root domain>.
function AdminApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute role="superadmin" />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/sites/new" element={<CreateSitePage />} />
              <Route path="/sites/:id/owner" element={<OwnerManagePage />} />
              <Route path="/sites/:id" element={<AdminSiteScope />}>
                <Route path="edit" element={<SiteEditorPage />} />
                <Route path="blog" element={<BlogPostsPage />} />
                <Route path="blog/new" element={<BlogPostEditorPage />} />
                <Route path="blog/:postId/edit" element={<BlogPostEditorPage />} />
              </Route>
            </Route>
            <Route path="/templates/:slug/preview" element={<TemplatePreviewPage />} />
            <Route path="/sites/:id/preview" element={<SitePreviewPage />} />
            <Route path="/sites/:id/blog/preview" element={<BlogPreviewPage />} />
            <Route path="/sites/:id/blog/preview/:postId" element={<BlogPreviewPage />} />
          </Route>
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default AdminApp
