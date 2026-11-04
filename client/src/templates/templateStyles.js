// Wording and header style shared by every template, so blog pages look like part of the site.
// Every template is now a village portal with the same sections; colours and fonts are in themes.js.
const SHARED_LOOK = {
  homeLabel: 'హోమ్',
  blogLabel: 'వార్తలు',
  blogHeading: 'వార్తలు & పోస్టులు',
  emptyText: 'ఇంకా పోస్టులు లేవు.',
  viewAllLabel: 'అన్ని పోస్టులు చూడండి →',
}

// Takes the slug so a template can still get its own wording later.
export function lookFor() {
  return SHARED_LOOK
}
