import { createContext } from 'react'

// Which site the editing screens work on, and where their links go. The super admin and an
// owner use the same screens, but reach them at different addresses.
export const SiteScopeContext = createContext(null)
