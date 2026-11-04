import { FaBriefcase, FaBullhorn, FaCakeCandles, FaRing, FaStore } from 'react-icons/fa6'

// Must match the server's ANNOUNCEMENT_CATEGORIES. The order is the order of the filter chips.
export const ANNOUNCEMENT_CATEGORIES = [
  { value: 'birthday', label: 'పుట్టినరోజులు', Icon: FaCakeCandles },
  { value: 'wedding', label: 'వివాహాలు', Icon: FaRing },
  { value: 'business', label: 'వ్యాపారం', Icon: FaStore },
  { value: 'jobs', label: 'ఉద్యోగాలు', Icon: FaBriefcase },
  { value: 'others', label: 'ఇతరాలు', Icon: FaBullhorn },
]

export const categoryInfo = (value) =>
  ANNOUNCEMENT_CATEGORIES.find((item) => item.value === value) ?? ANNOUNCEMENT_CATEGORIES[4]
