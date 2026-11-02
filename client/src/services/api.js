// All server calls live here, so a URL change never means hunting through components.
export async function getServerHealth() {
  const res = await fetch('/api/health')
  // fetch only rejects on network failure, so a 500 from the proxy must be caught here.
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
