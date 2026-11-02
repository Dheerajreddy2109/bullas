import Site from '../../models/Site.js';

const ROOT_DOMAIN = process.env.ROOT_DOMAIN?.toLowerCase();

// Fail at startup: without this, every site would silently return 404.
if (!ROOT_DOMAIN) {
  throw new Error('ROOT_DOMAIN is missing. Check server/.env');
}

export async function findSiteByHostname(hostname) {
  if (!hostname) return null;

  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (host === ROOT_DOMAIN) return null;

  const suffix = `.${ROOT_DOMAIN}`;
  if (host.endsWith(suffix)) {
    const subdomain = host.slice(0, -suffix.length);
    // One level only, so a.demo.bullas.in can't pose as the demo site.
    if (subdomain.includes('.')) return null;
    return Site.findOne({ subdomain });
  }

  // Connected only: anyone can point DNS here, so an unverified domain must not match.
  return Site.findOne({ customDomain: host, domainStatus: 'connected' });
}

// Finds drafts too, because owners will need to edit them; public routes must check status.
export async function resolveSite(req, res, next) {
  req.site = await findSiteByHostname(req.hostname);
  next();
}

export function requireSite(req, res, next) {
  if (!req.site) {
    return res.status(404).json({ error: 'Site not found' });
  }
  next();
}
