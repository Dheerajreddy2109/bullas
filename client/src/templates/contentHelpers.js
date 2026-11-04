// Turns the editable sections into { village: { name: '...' } }, so layouts stay easy to read.
export function readContent(content) {
  const result = {}
  for (const section of content?.sections ?? []) {
    result[section.key] = {}
    for (const [key, field] of Object.entries(section.fields ?? {})) {
      result[section.key][key] = field?.value
    }
  }
  return result
}

// Content comes from site owners, so anything used in styles or links is checked first.
export function safeColor(value, fallback) {
  return /^#[0-9a-f]{3,8}$/i.test(value ?? '') ? value : fallback
}

// Blocks javascript: links, which would run an owner's script in a visitor's browser.
export function safeHref(value) {
  return /^(#|\/(?!\/)|https?:\/\/)/i.test(value ?? '') ? value : '#'
}

// Menu links to the blog must stay inside admin previews, whose blog is at a different address.
export function blogAwareHref(href, blogHref) {
  return href === '/blog' || href?.startsWith('/blog?') ? `${blogHref}${href.slice('/blog'.length)}` : href
}

export function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`
}
