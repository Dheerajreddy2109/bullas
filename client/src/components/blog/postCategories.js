// Must match the server's POST_CATEGORIES. The order is the order of the tabs and chips.
export const POST_CATEGORIES = [
  { value: 'history', label: 'Village history', telugu: 'గ్రామ చరిత్ర' },
  { value: 'daily', label: 'Daily update', telugu: 'రోజువారీ అప్‌డేట్లు' },
  { value: 'announcement', label: 'Announcement', telugu: 'ప్రకటనలు' },
  { value: 'gallery', label: 'Photo gallery', telugu: 'ఫోటో గ్యాలరీ' },
]

// Posts saved before categories existed come back as daily updates.
export const categoryOf = (post) => POST_CATEGORIES.find((item) => item.value === post?.category) ?? POST_CATEGORIES[1]
