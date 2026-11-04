// Builds a site's address the same way the app picks sites: subdomain + root domain.
// Keeps this page's protocol and port, so it's http://name.localhost:5173 on your computer
// and https://name.bullas.in on the live server.
const ROOT_DOMAIN = (import.meta.env.VITE_ROOT_DOMAIN ?? 'localhost').toLowerCase()

export function siteAddress(subdomain, path = '') {
  const { protocol, port } = window.location
  return `${protocol}//${subdomain}.${ROOT_DOMAIN}${port ? `:${port}` : ''}${path}`
}
