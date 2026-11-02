import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import CreateSitePage from './pages/CreateSitePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SitesPage from './pages/SitesPage.jsx'
import TemplatePreviewPage from './pages/TemplatePreviewPage.jsx'
import TemplatesPage from './pages/TemplatesPage.jsx'

// The server only allows super admin login on this address, so the screens live here too.
const isAdminApp = window.location.hostname.startsWith('admin.')

function App() {
  if (!isAdminApp) return <HomePage />

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/sites/new" element={<CreateSitePage />} />
            </Route>
            <Route path="/templates/:slug/preview" element={<TemplatePreviewPage />} />
          </Route>
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
