// The languages a site can be read in. The codes are the ones Google Translate uses.
export const SITE_LANGUAGES = ['te', 'en', 'ta', 'or', 'hi', 'ml'];
// Existing and new sites start in Telugu, the language of the templates' sample text.
export const DEFAULT_LANGUAGE = 'te';

// From a visitor's ?lang=. Anything unknown means "show the original", not an error.
export const readLanguage = (value) => (SITE_LANGUAGES.includes(value) ? value : null);
