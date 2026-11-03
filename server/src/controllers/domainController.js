import mongoose from 'mongoose';
import Site from '../../models/Site.js';
import { checkDomainDns } from '../services/dnsCheck.js';
import { isPlatformDomain, normalizeDomain } from '../utils/domainRules.js';

const ROOT_DOMAIN = process.env.ROOT_DOMAIN?.toLowerCase();
// Read from .env, so the live server's real values are shown without changing code.
const CNAME_TARGET = process.env.CNAME_TARGET || `sites.${ROOT_DOMAIN}`;
const SERVER_IP = process.env.SERVER_IP || '';

function domainSummary(site) {
  return {
    customDomain: site.customDomain ?? '',
    domainStatus: site.domainStatus,
    domainMessage: site.domainMessage,
    domainCheckedAt: site.domainCheckedAt,
    subdomainAddress: `${site.subdomain}.${ROOT_DOMAIN}`,
    cnameTarget: CNAME_TARGET,
    serverIp: SERVER_IP,
  };
}

async function loadSite(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: 'Invalid site ID' });
    return null;
  }
  const site = await Site.findById(req.params.id);
  if (!site) res.status(404).json({ error: 'Site not found' });
  return site;
}

export async function getDomain(req, res) {
  const site = await loadSite(req, res);
  if (site) res.json(domainSummary(site));
}

export async function setDomain(req, res) {
  const domain = normalizeDomain(req.body?.domain);
  if (!domain) {
    return res.status(400).json({ error: 'Enter a domain like dheeraj.com' });
  }
  if (isPlatformDomain(domain, ROOT_DOMAIN)) {
    return res.status(400).json({ error: `${ROOT_DOMAIN} addresses are already connected automatically` });
  }

  const site = await loadSite(req, res);
  if (!site) return;

  if (site.customDomain !== domain) {
    site.customDomain = domain;
    // A new domain must be checked again before it can go live or get a certificate.
    site.domainStatus = 'pending';
    site.domainMessage = 'Waiting for the DNS records to be added, then click Verify.';
    site.domainCheckedAt = undefined;
  }

  try {
    await site.save();
  } catch (err) {
    // Relies on the unique index, so two sites can't claim one domain even at the same moment.
    if (err.code === 11000) {
      return res.status(409).json({ error: 'That domain is already used by another site' });
    }
    throw err;
  }
  res.json(domainSummary(site));
}

export async function verifyDomain(req, res) {
  const site = await loadSite(req, res);
  if (!site) return;
  if (!site.customDomain) {
    return res.status(400).json({ error: 'Save a domain before verifying it' });
  }

  let result;
  try {
    result = await checkDomainDns(site.customDomain, { cnameTarget: CNAME_TARGET, serverIp: SERVER_IP });
  } catch (err) {
    result = { ok: false, message: `The DNS check couldn't finish (${err.code ?? err.message}). Try again shortly.` };
  }

  site.domainStatus = result.ok ? 'connected' : 'failed';
  site.domainMessage = result.message;
  site.domainCheckedAt = new Date();
  await site.save();
  res.json(domainSummary(site));
}

export async function removeDomain(req, res) {
  const site = await loadSite(req, res);
  if (!site) return;

  site.customDomain = undefined;
  site.domainStatus = 'none';
  site.domainMessage = '';
  site.domainCheckedAt = undefined;
  await site.save();
  res.json(domainSummary(site));
}

// For Caddy only: approves a certificate just for connected customer domains, so strangers
// can't make the server request certificates for domains that aren't ours.
export async function isDomainAllowed(req, res) {
  const host = typeof req.query.domain === 'string' ? req.query.domain.toLowerCase().replace(/\.$/, '') : '';
  const domain = normalizeDomain(host);
  if (!domain || isPlatformDomain(domain, ROOT_DOMAIN)) return res.status(404).end();

  // normalizeDomain has already removed www., so www.dheeraj.com is approved with dheeraj.com.
  const site = await Site.exists({ customDomain: domain, domainStatus: 'connected' });
  res.status(site ? 200 : 404).end();
}
