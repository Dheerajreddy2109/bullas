import dns from 'node:dns';

const TIMEOUT_MS = 5000;

// Swappable so tests can give fixed answers instead of depending on the real internet.
let resolver = dns.promises;
export function useResolverForTests(fakeResolver) {
  resolver = fakeResolver ?? dns.promises;
}

const clean = (name) => name.toLowerCase().replace(/\.$/, '');

// Answers [] for "no such record", so a missing record is a normal result, not a crash.
async function lookup(method, name) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(Object.assign(new Error('DNS timeout'), { code: 'ETIMEOUT' })), TIMEOUT_MS)
  );
  try {
    return await Promise.race([resolver[method](name), timeout]);
  } catch (err) {
    if (['ENOTFOUND', 'ENODATA', 'NXDOMAIN', 'ESERVFAIL'].includes(err.code)) return [];
    throw err;
  }
}

// Passes if any accepted setup points at us: the name itself or www by CNAME, or the name by A record.
export async function checkDomainDns(domain, { cnameTarget, serverIp }) {
  const target = clean(cnameTarget);
  const found = [];

  for (const name of [domain, `www.${domain}`]) {
    const cnames = (await lookup('resolveCname', name)).map(clean);
    if (cnames.includes(target)) return { ok: true, message: `${name} points to ${target} by CNAME.` };
    if (cnames.length) found.push(`${name} has a CNAME to ${cnames.join(', ')}`);
  }

  if (serverIp) {
    const addresses = await lookup('resolve4', domain);
    if (addresses.includes(serverIp)) return { ok: true, message: `${domain} points to ${serverIp} by A record.` };
    if (addresses.length) found.push(`${domain} has an A record to ${addresses.join(', ')}`);
  }

  const expected = serverIp
    ? `a CNAME to ${target}, or an A record for the main domain to ${serverIp}`
    : `a CNAME to ${target}`;
  return {
    ok: false,
    message:
      `Expected ${expected}. ${found.length ? `Found: ${found.join('; ')}.` : 'No matching records were found.'} ` +
      'DNS changes can take a while to spread, so try again in a few minutes.',
  };
}
