// Must match the server's ANNOUNCEMENT_CATEGORIES. The order is the order of the filter chips.
export const ANNOUNCEMENT_CATEGORIES = [
  { value: 'birthday', label: 'పుట్టినరోజులు', icon: '🎂' },
  { value: 'wedding', label: 'వివాహాలు', icon: '💍' },
  { value: 'business', label: 'వ్యాపారం', icon: '🏪' },
  { value: 'jobs', label: 'ఉద్యోగాలు', icon: '💼' },
  { value: 'others', label: 'ఇతరాలు', icon: '📢' },
]

export const categoryInfo = (value) =>
  ANNOUNCEMENT_CATEGORIES.find((item) => item.value === value) ?? ANNOUNCEMENT_CATEGORIES[4]
