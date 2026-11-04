import { FaBriefcase, FaBullhorn, FaCakeCandles, FaRing, FaStore } from 'react-icons/fa6'

// Must match the server's ANNOUNCEMENT_CATEGORIES. The order is the order of the filter chips.
// Their wording is in templates/labels.js, as ann_birthday and so on.
export const ANNOUNCEMENT_CATEGORIES = [
  { value: 'birthday', Icon: FaCakeCandles },
  { value: 'wedding', Icon: FaRing },
  { value: 'business', Icon: FaStore },
  { value: 'jobs', Icon: FaBriefcase },
  { value: 'others', Icon: FaBullhorn },
]

export const categoryInfo = (value) =>
  ANNOUNCEMENT_CATEGORIES.find((item) => item.value === value) ?? ANNOUNCEMENT_CATEGORIES[4]
