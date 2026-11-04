import { createContext } from 'react'
import { DEFAULT_LANGUAGE } from '../templates/labels.js'

// Which language the site is showing, for every part of the page without passing it down by hand.
// onChange is set only on the public site, so the dropdown doesn't appear in admin previews.
export const LanguageContext = createContext({ language: DEFAULT_LANGUAGE, onChange: null, isTranslated: false })
