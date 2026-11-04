import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import SiteNotFound from './SiteNotFound.jsx'
import { LanguageContext } from '../context/LanguageContext.js'
import { getPublicSite } from '../services/api.js'
import { LANGUAGES } from '../templates/labels.js'

const STORAGE_KEY = 'bullas-language'

// A convenience only: private windows can block storage, and the site must still work.
function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.some((item) => item.code === stored) ? stored : null
  } catch {
    return null
  }
}

function storeLanguage(language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // The choice just won't be remembered next time.
  }
}

// Loads the site once for every public page, so moving between pages doesn't reload it.
// It loads again only when the visitor picks another language.
function PublicSiteLayout() {
  const [site, setSite] = useState(null)
  const [error, setError] = useState(null)
  const [chosen, setChosen] = useState(readStoredLanguage)

  useEffect(() => {
    // A slow answer for an earlier choice must not replace the language picked since.
    let current = true
    getPublicSite(chosen)
      .then((data) => {
        if (!current) return
        setSite(data)
        document.title = data.name
      })
      .catch((err) => current && setError(err))
    return () => {
      current = false
    }
  }, [chosen])

  const language = chosen ?? site?.language
  useEffect(() => {
    // Tells browsers and screen readers which language to read the page in.
    if (language) document.documentElement.lang = language
  }, [language])

  const languageValue = useMemo(
    () => ({
      language,
      isTranslated: Boolean(site) && language !== site.language,
      onChange: (next) => {
        storeLanguage(next)
        setChosen(next)
      },
    }),
    [language, site],
  )

  if (error?.status === 404) return <SiteNotFound />
  if (error) return <SiteNotFound title="Something went wrong" message="Please try again in a moment." />
  if (!site) return null

  return (
    <LanguageContext.Provider value={languageValue}>
      <Outlet context={{ site }} />
    </LanguageContext.Provider>
  )
}

export default PublicSiteLayout
