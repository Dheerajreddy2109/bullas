import { useEffect, useState } from 'react'
import { getSiteContent } from '../services/api.js'
import { readContent } from '../templates/contentHelpers.js'

// Sent by the content editor after a save, so the owner's sidebar updates without a page refresh.
export const SITE_SAVED_EVENT = 'bullas-site-saved'

const logoOf = (content) => readContent(content).branding?.logo || ''

// The site's name and logo, for the owner's admin panel. Pass null to skip it (the Bullas admin area).
export function useSiteBranding(siteId) {
  const [branding, setBranding] = useState({ name: '', logo: '' })

  useEffect(() => {
    if (!siteId) return
    getSiteContent(siteId)
      .then((site) => setBranding({ name: site.name, logo: logoOf(site.content) }))
      .catch(() => setBranding({ name: '', logo: '' }))

    // The saved content arrives with the event, so there's no second request to the server.
    function onSaved(event) {
      if (event.detail?.siteId !== siteId) return
      setBranding((current) => ({ ...current, logo: logoOf(event.detail.content) }))
    }
    window.addEventListener(SITE_SAVED_EVENT, onSaved)
    return () => window.removeEventListener(SITE_SAVED_EVENT, onSaved)
  }, [siteId])

  return branding
}
