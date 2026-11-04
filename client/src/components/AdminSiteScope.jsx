import { Outlet, useParams } from 'react-router-dom'
import { SiteScopeContext } from '../context/SiteScopeContext.js'

// For the super admin, the site comes from the address bar; the server still checks access.
function AdminSiteScope() {
  const { id } = useParams()
  const scope = {
    siteId: id,
    base: `/sites/${id}`,
    previewHref: `/sites/${id}/preview`,
    blogPreviewHref: `/sites/${id}/blog/preview`,
    previewIsExternal: false,
    // The start of every breadcrumb trail for this site; pages add their own last part.
    needsSiteName: true,
    siteCrumbs: (siteName) => [
      { label: 'Dashboard', to: '/' },
      { label: 'Sites', to: '/sites' },
      { label: siteName || 'Site', to: `/sites/${id}/edit` },
    ],
  }

  return (
    <SiteScopeContext.Provider value={scope}>
      <Outlet />
    </SiteScopeContext.Provider>
  )
}

export default AdminSiteScope
