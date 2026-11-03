// Each template's header style, colours and blog wording, so blog pages look like part of the site.
const TEMPLATE_LOOKS = {
  'panchayat-classic': {
    variant: 'banner',
    ink: '#12263f',
    tint: '#d7eedd',
    blogLabel: 'వార్తలు',
    blogHeading: 'వార్తలు & పోస్టులు',
    backLabel: 'అన్ని పోస్టులు',
    emptyText: 'ఇంకా పోస్టులు లేవు.',
  },
  'business-starter': { variant: 'split', ink: '#0f172a', tint: '#dbe7ff', blogLabel: 'Blog', blogHeading: 'Blog' },
  'portfolio-light': { variant: 'minimal', ink: '#1c1917', tint: '#ede9fe', blogLabel: 'Journal', blogHeading: 'Journal' },
  'local-shop': { variant: 'split', ink: '#431407', tint: '#ffedd5', blogLabel: 'News', blogHeading: 'News' },
}

const DEFAULT_LOOK = {
  backLabel: 'Back to blog',
  emptyText: 'No posts yet.',
}

export function lookFor(templateSlug) {
  return { ...DEFAULT_LOOK, ...(TEMPLATE_LOOKS[templateSlug] ?? TEMPLATE_LOOKS['business-starter']) }
}
