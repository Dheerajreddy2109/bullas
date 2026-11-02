export function getPublicSite(req, res) {
  // Same response as an unknown site, so visitors can't discover unpublished sites.
  if (req.site.status !== 'published') {
    return res.status(404).json({ error: 'Site not found' });
  }

  // An explicit list, so private fields added to Site later can't leak by default.
  const { name, subdomain, content } = req.site;
  res.json({ name, subdomain, content });
}
