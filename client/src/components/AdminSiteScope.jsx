import { Outlet, useParams } from 'react-router-dom'
import { SiteScopeContext } from '../context/SiteScopeContext.js'

// For the super admin, the site comes from the address bar; the server still checks access.
function AdminSiteScope() {
  const { id } = useParams()
  const scope = {
    siteId: id,
    base: `/sites/${id}`,
    backHref: '/sites',
    backLabel: 'Back to sites',
    previewHref: `/sites/${id}/preview`,
    blogPreviewHref: `/sites/${id}/blog/preview`,
    previewIsExternal: false,
  }

  return (
    <SiteScopeContext.Provider value={scope}>
      <Outlet />
    </SiteScopeContext.Provider>
  )
}

export default AdminSiteScope
