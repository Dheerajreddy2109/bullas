import { createElement } from 'react'
import VillagePortalLayout from './VillagePortalLayout.jsx'

// Connects the slug stored in the database to the code that draws it.
// Every template has the same sections and layout; templateSlug picks its colours, fonts and shapes.
const themed = (templateSlug) => {
  const ThemedLayout = (props) => createElement(VillagePortalLayout, { ...props, templateSlug })
  ThemedLayout.displayName = `Layout(${templateSlug})`
  return ThemedLayout
}

export const templateLayouts = {
  'business-starter': themed('business-starter'),
  'local-shop': themed('local-shop'),
  'panchayat-classic': themed('panchayat-classic'),
  'portfolio-light': themed('portfolio-light'),
}
