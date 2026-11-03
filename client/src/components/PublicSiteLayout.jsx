import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import SiteNotFound from './SiteNotFound.jsx'
import { getPublicSite } from '../services/api.js'

// Loads the site once for every public page, so moving between pages doesn't reload it.
function PublicSiteLayout() {
  const [site, setSite] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPublicSite()
      .then((data) => {
        setSite(data)
        document.title = data.name
      })
      .catch(setError)
  }, [])

  if (error?.status === 404) return <SiteNotFound />
  if (error) return <SiteNotFound title="Something went wrong" message="Please try again in a moment." />
  if (!site) return null

  return <Outlet context={{ site }} />
}

export default PublicSiteLayout
