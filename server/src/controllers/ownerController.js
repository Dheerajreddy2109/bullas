// Reads req.site, which requireAuth has matched to the owner, so no ID comes from the browser.
export function getOwnSite(req, res) {
  const { name, subdomain, status, content } = req.site;
  res.json({ name, subdomain, status, content });
}
