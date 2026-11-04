import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminSiteScope from '../components/AdminSiteScope.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import AuthProvider from '../context/AuthProvider.jsx'
import BlogPostEditorPage from '../pages/BlogPostEditorPage.jsx'
import BlogPostsPage from '../pages/BlogPostsPage.jsx'
import BlogPreviewPage from '../pages/BlogPreviewPage.jsx'
import CreateSitePage from '../pages/CreateSitePage.jsx'
import CreateUserPage from '../pages/CreateUserPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import DomainPage from '../pages/DomainPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import OwnerManagePage from '../pages/OwnerManagePage.jsx'
import ChangePasswordPage from '../pages/owner/ChangePasswordPage.jsx'
import SiteEditorPage from '../pages/SiteEditorPage.jsx'
import SitePreviewPage from '../pages/SitePreviewPage.jsx'
import SitesPage from '../pages/SitesPage.jsx'
import TemplatePreviewPage from '../pages/TemplatePreviewPage.jsx'
import TemplatesPage from '../pages/TemplatesPage.jsx'
import TwoFactorPage from '../pages/TwoFactorPage.jsx'
import UserManagePage from '../pages/UserManagePage.jsx'
import UsersPage from '../pages/UsersPage.jsx'

// The admin area for the super admin and builders, served only on admin.<root domain>.
function AdminApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage logo="/logo.jpeg" logoAlt="Bullas Group" />} />
          <Route
            element={<ProtectedRoute roles={['superadmin', 'builder']} changePasswordPath="/change-password" twoFactorPath="/two-factor" />}
          >
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/sites/new" element={<CreateSitePage />} />
              <Route path="/change-password" element={<ChangePasswordPage homePath="/" />} />
              <Route path="/two-factor" element={<TwoFactorPage />} />
              {/* Users, owners and domains are for the super admin only, as agreed. */}
              <Route element={<ProtectedRoute roles={['superadmin']} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/new" element={<CreateUserPage />} />
                <Route path="/users/:userId" element={<UserManagePage />} />
                <Route path="/sites/:id/owner" element={<OwnerManagePage />} />
                <Route path="/sites/:id/domain" element={<DomainPage />} />
              </Route>
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
