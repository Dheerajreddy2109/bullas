import { LanguageContext } from '../context/LanguageContext.js'

// For admin previews: the fixed wording follows the language the site is written in.
function LanguageScope({ language, children }) {
  return (
    <LanguageContext.Provider value={{ language, onChange: null, isTranslated: false }}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageScope
