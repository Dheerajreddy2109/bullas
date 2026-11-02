import BusinessStarterLayout from './BusinessStarterLayout.jsx'
import LocalShopLayout from './LocalShopLayout.jsx'
import PanchayatClassicLayout from './PanchayatClassicLayout.jsx'
import PortfolioLightLayout from './PortfolioLightLayout.jsx'

// Connects the slug stored in the database to the code that draws it.
export const templateLayouts = {
  'business-starter': BusinessStarterLayout,
  'local-shop': LocalShopLayout,
  'panchayat-classic': PanchayatClassicLayout,
  'portfolio-light': PortfolioLightLayout,
}
