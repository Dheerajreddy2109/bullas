// Each template's look: fonts, colours and shapes. Every template has the same sections;
// only these values differ. Section styles read them as CSS variables (var(--ink) and so on),
// and `look` lets a style change shapes too, through [data-look='heritage'] rules.
//
// Fonts are served from this app (the @fontsource packages), not Google, so visitors aren't tracked.
// The browser only downloads a font file when a page actually uses it.
import '@fontsource/ramabhadra/400.css'
import '@fontsource/tiro-telugu/400.css'
import '@fontsource/anek-telugu/400.css'
import '@fontsource/anek-telugu/600.css'
import '@fontsource/anek-telugu/700.css'
import '@fontsource/anek-telugu/800.css'
import '@fontsource/mandali/400.css'
import '@fontsource/noto-sans-tamil/400.css'
import '@fontsource/noto-sans-tamil/700.css'
import '@fontsource/noto-sans-oriya/400.css'
import '@fontsource/noto-sans-oriya/700.css'
import '@fontsource/noto-sans-devanagari/400.css'
import '@fontsource/noto-sans-devanagari/700.css'
import '@fontsource/noto-sans-malayalam/400.css'
import '@fontsource/noto-sans-malayalam/700.css'

// Each theme's own font covers Telugu and English; the browser takes other scripts from these.
const OTHER_SCRIPTS = "'Noto Sans Tamil', 'Noto Sans Oriya', 'Noto Sans Devanagari', 'Noto Sans Malayalam'"
const FALLBACK_FONTS = `'Noto Sans Telugu', ${OTHER_SCRIPTS}, system-ui, sans-serif`

const THEMES = {
  // Bright and colourful, like the reference village portal.
  'panchayat-classic': {
    look: 'classic',
    vars: {
      // How far this theme's body font sits its letters from the middle of their line.
      '--text-nudge': '0.17em',
      '--font-heading': `'Ramabhadra', ${FALLBACK_FONTS}`,
      '--font-body': `'Anek Telugu', ${FALLBACK_FONTS}`,
      '--heading-weight': '400',
      '--ink': '#12263f',
      '--text': '#374151',
      '--page-bg': '#f7f9fb',
      '--surface': '#ffffff',
      '--topbar-bg': '#10243e',
      '--footer': '#10243e',
      '--banner-bg':
        'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.55), transparent 40%), linear-gradient(180deg, #bde0f3 0%, #e6f4e3 60%, #cfe9b8 100%)',
      '--banner-title': 'var(--brand)',
      '--banner-subtitle': '#1e4e8c',
      '--banner-text': '#334155',
      '--number-bg': '#d81e2c',
      '--number-text': '#ffffff',
      '--tone-cream': '#fff8e8',
      '--tone-green': '#ecf8ee',
      '--tone-blue': '#eaf3fc',
      '--tone-peach': '#fff1e6',
      '--tone-pink': '#fdeef3',
      '--tone-violet': '#f3effd',
      '--panel-border': '1px solid rgba(0,0,0,0.05)',
      '--scheme-a': '#ffe7d1',
      '--scheme-b': '#fde0e8',
      '--scheme-title': '#b3261e',
      '--pill-1': '#1d5fc4',
      '--pill-2': '#c9540f',
      '--pill-3': '#137a40',
      '--pill-4': '#7c3aed',
      '--pill-5': '#d81e5b',
      '--pill-6': '#0e7490',
      '--radius-panel': '16px',
      '--radius-card': '12px',
    },
  },

  // Maroon and gold, warm cream, a traditional font and temple-style borders.
  'portfolio-light': {
    look: 'heritage',
    vars: {
      // How far this theme's body font sits its letters from the middle of their line.
      '--text-nudge': '0.04em',
      '--font-heading': `'Tiro Telugu', ${OTHER_SCRIPTS}, serif`,
      '--font-body': `'Tiro Telugu', ${OTHER_SCRIPTS}, serif`,
      '--heading-weight': '400',
      '--ink': '#5b1414',
      '--text': '#3f2a1d',
      '--page-bg': '#fbf4e4',
      '--surface': '#fffaf0',
      '--topbar-bg': '#4a0f0f',
      '--footer': '#3b0b0b',
      '--banner-bg':
        'radial-gradient(circle at 50% 0%, rgba(255,215,128,0.35), transparent 55%), linear-gradient(180deg, #7f1d1d 0%, #5b1414 100%)',
      '--banner-title': '#f6d27a',
      '--banner-subtitle': '#fde9b5',
      '--banner-text': '#f3e3c3',
      '--number-bg': '#7f1d1d',
      '--number-text': '#f6d27a',
      '--tone-cream': '#fdf3dc',
      '--tone-green': '#f7efd9',
      '--tone-blue': '#fbf1e1',
      '--tone-peach': '#fcecd6',
      '--tone-pink': '#f9e8dc',
      '--tone-violet': '#f6ecdf',
      '--panel-border': '2px solid #d4a64a',
      '--scheme-a': '#f9e7c4',
      '--scheme-b': '#f5dcc8',
      '--scheme-title': '#7f1d1d',
      '--pill-1': '#7f1d1d',
      '--pill-2': '#9a5b13',
      '--pill-3': '#7f1d1d',
      '--pill-4': '#9a5b13',
      '--pill-5': '#7f1d1d',
      '--pill-6': '#9a5b13',
      '--radius-panel': '6px',
      '--radius-card': '6px',
    },
  },

  // Navy and white, one blue accent, flat cards and thin lines.
  'business-starter': {
    look: 'modern',
    vars: {
      // How far this theme's body font sits its letters from the middle of their line.
      '--text-nudge': '0.17em',
      '--font-heading': `'Anek Telugu', ${FALLBACK_FONTS}`,
      '--font-body': `'Anek Telugu', ${FALLBACK_FONTS}`,
      '--heading-weight': '700',
      '--ink': '#0f172a',
      '--text': '#334155',
      '--page-bg': '#f8fafc',
      '--surface': '#ffffff',
      '--topbar-bg': '#0f172a',
      '--footer': '#0f172a',
      '--banner-bg': 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
      '--banner-title': '#ffffff',
      '--banner-subtitle': '#93c5fd',
      '--banner-text': '#cbd5e1',
      '--number-bg': '#2563eb',
      '--number-text': '#ffffff',
      '--tone-cream': '#ffffff',
      '--tone-green': '#ffffff',
      '--tone-blue': '#ffffff',
      '--tone-peach': '#ffffff',
      '--tone-pink': '#ffffff',
      '--tone-violet': '#ffffff',
      '--panel-border': '1px solid #e2e8f0',
      '--scheme-a': '#eff6ff',
      '--scheme-b': '#f1f5f9',
      '--scheme-title': '#1e3a8a',
      '--pill-1': '#1e3a8a',
      '--pill-2': '#1e3a8a',
      '--pill-3': '#1e3a8a',
      '--pill-4': '#1e3a8a',
      '--pill-5': '#1e3a8a',
      '--pill-6': '#1e3a8a',
      '--radius-panel': '10px',
      '--radius-card': '8px',
    },
  },

  // Greens and earth tones, rounded cards and leaf-tinted sections.
  'local-shop': {
    look: 'green',
    vars: {
      // How far this theme's body font sits its letters from the middle of their line.
      '--text-nudge': '-0.06em',
      '--font-heading': `'Anek Telugu', ${FALLBACK_FONTS}`,
      '--font-body': `'Mandali', ${FALLBACK_FONTS}`,
      '--heading-weight': '800',
      '--ink': '#14532d',
      '--text': '#3f3a2e',
      '--page-bg': '#f3f7ee',
      '--surface': '#ffffff',
      '--topbar-bg': '#14532d',
      '--footer': '#1f3d1f',
      '--banner-bg':
        'radial-gradient(ellipse at 50% 120%, #86c06c 0%, transparent 60%), linear-gradient(180deg, #e8f5d8 0%, #cfe8b4 100%)',
      '--banner-title': '#14532d',
      '--banner-subtitle': '#7c5a2b',
      '--banner-text': '#3f3a2e',
      '--number-bg': '#15803d',
      '--number-text': '#ffffff',
      '--tone-cream': '#f6f1e4',
      '--tone-green': '#e8f4dd',
      '--tone-blue': '#e5f2ea',
      '--tone-peach': '#f4ecdc',
      '--tone-pink': '#eef5e3',
      '--tone-violet': '#e9f1e4',
      '--panel-border': '1px solid rgba(21,128,61,0.18)',
      '--scheme-a': '#e3f1d6',
      '--scheme-b': '#f1e8d3',
      '--scheme-title': '#14532d',
      '--pill-1': '#15803d',
      '--pill-2': '#7c5a2b',
      '--pill-3': '#166534',
      '--pill-4': '#a16207',
      '--pill-5': '#3f6212',
      '--pill-6': '#854d0e',
      '--radius-panel': '28px',
      '--radius-card': '20px',
    },
  },
}

export function themeFor(templateSlug) {
  return THEMES[templateSlug] ?? THEMES['panchayat-classic']
}
