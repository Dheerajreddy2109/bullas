// All server calls live here, so a URL change never means hunting through components.
async function request(path, options = {}) {
  const res = await fetch(path, options)
  const data = await res.json().catch(() => null)

  // fetch only rejects on network failure, so error statuses must be turned into errors here.
  if (!res.ok) {
    const error = new Error(data?.error ?? `HTTP ${res.status}`)
    error.status = res.status
    throw error
  }
  return data
}

// The server refuses data-changing requests that aren't JSON, to block other sites' forms.
function sendJson(method, path, body = {}) {
  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export const getServerHealth = () => request('/api/health')

export const login = (email, password) => sendJson('POST', '/api/auth/login', { email, password })
export const logout = () => sendJson('POST', '/api/auth/logout')
export const getCurrentUser = () => request('/api/auth/me')

export const getTemplates = () => request('/api/admin/templates')
export const getTemplate = (slug) => request(`/api/admin/templates/${encodeURIComponent(slug)}`)

export const getSites = () => request('/api/sites')
export const createSite = (site) => sendJson('POST', '/api/sites', site)
export const updateSiteStatus = (id, status) =>
  sendJson('PATCH', `/api/sites/${encodeURIComponent(id)}/status`, { status })

export const getSiteContent = (id) => request(`/api/sites/${encodeURIComponent(id)}/content`)
export const saveSiteContent = (id, content) =>
  sendJson('PUT', `/api/sites/${encodeURIComponent(id)}/content`, { content })

export function uploadSiteImage(id, file) {
  const body = new FormData()
  body.append('image', file)
  return request(`/api/sites/${encodeURIComponent(id)}/upload`, {
    method: 'POST',
    // The server requires this header, because other sites' pages can't send it.
    headers: { 'X-Bullas-Upload': '1' },
    body,
  })
}
