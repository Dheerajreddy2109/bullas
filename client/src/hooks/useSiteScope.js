import { useContext } from 'react'
import { SiteScopeContext } from '../context/SiteScopeContext.js'

export function useSiteScope() {
  return useContext(SiteScopeContext)
}
