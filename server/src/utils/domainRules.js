import { domainToASCII } from 'node:url';

// Names that can never be real public websites, so they can't be connected or get certificates.
const RESERVED_ENDINGS = ['localhost', 'local', 'test', 'internal', 'invalid', 'example'];

// Turns what someone typed into one standard form, or null if it isn't a usable domain.
// "https://WWW.Dheeraj.com/" becomes "dheeraj.com", so the same domain can't be saved twice.
export function normalizeDomain(input) {
  if (typeof input !== 'string') return null;

  let domain = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/\.$/, '');
  if (domain.startsWith('www.')) domain = domain.slice(4);

  // Converts names like తెలుగు.com to the xn-- form that DNS and certificates use.
  domain = domainToASCII(domain);
  if (!domain || domain.length > 253) return null;

  const labels = domain.split('.');
  if (labels.length < 2) return null;
  if (!labels.every((label) => /^(?!-)[a-z0-9-]{1,63}(?<!-)$/.test(label))) return null;

  // An all-number ending means an IP address, which can't have a certificate this way.
  const ending = labels.at(-1);
  if (!/^(xn--[a-z0-9-]+|[a-z]{2,63})$/.test(ending)) return null;
  if (RESERVED_ENDINGS.includes(ending)) return null;

  return domain;
}

// The platform's own names are served by the wildcard certificate, never as custom domains.
export function isPlatformDomain(domain, rootDomain) {
  return domain === rootDomain || domain.endsWith(`.${rootDomain}`);
}
