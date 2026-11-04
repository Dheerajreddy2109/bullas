import { useEffect } from 'react'

// Opening a page at an address like /#contact: the browser looks for the section straight away,
// but it's drawn only after the site's data arrives, so the browser gives up. This does the jump
// once the section exists. Pass something that changes when late content (like blog posts) arrives
// and moves the sections down, so the page still ends up in the right place.
export function useScrollToHash(lateContent) {
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    let id = hash
    try {
      id = decodeURIComponent(hash)
    } catch {
      // A badly formed address; look for it as written, which simply finds nothing.
    }
    document.getElementById(id)?.scrollIntoView()
  }, [lateContent])
}
