import { Outlet } from 'react-router-dom'
import { SiteScopeContext } from '../context/SiteScopeContext.js'
import { useAuth } from '../hooks/useAuth.js'

// For an owner, the site always comes from their own login, never from the address bar,
// so there is no ID to change. The server enforces the same rule.
function OwnerSiteScope() {
  const { user } = useAuth()
  const scope = {
    siteId: user.siteId,
    base: '/admin',
    // The owner's real site is on this same address, so previews open it in a new tab.
    previewHref: '/',
    blogPreviewHref: '/blog',
    previewIsExternal: true,
    // An owner only has one site, so their trail starts at their dashboard, without a site name.
    needsSiteName: false,
    siteCrumbs: () => [{ label: 'Dashboard', to: '/admin' }],
  }

  return (
    <SiteScopeContext.Provider value={scope}>
      <Outlet />
    </SiteScopeContext.Provider>
  )
}

export default OwnerSiteScope
