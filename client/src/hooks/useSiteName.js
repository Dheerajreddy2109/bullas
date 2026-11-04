import { useEffect, useState } from 'react'
import { getSiteContent } from '../services/api.js'

// The site's name, for breadcrumbs on pages that don't load the site themselves.
// Pass null to skip the request, for example when the trail doesn't need the name.
export function useSiteName(siteId) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (!siteId) return
    getSiteContent(siteId)
      .then((site) => setName(site.name))
      .catch(() => setName(''))
  }, [siteId])

  return name
}
