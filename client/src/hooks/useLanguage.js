import { useContext } from 'react'
import { LanguageContext } from '../context/LanguageContext.js'
import { labelsFor } from '../templates/labels.js'

// The current language plus its fixed wording, e.g. labels.viewAllPosts.
export function useLanguage() {
  const value = useContext(LanguageContext)
  return { ...value, labels: labelsFor(value.language) }
}
