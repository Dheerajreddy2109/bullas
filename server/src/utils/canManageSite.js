// The one permission rule for site data, so every route answers the question the same way.
// It takes the site itself, because a builder's access depends on who the site is assigned to.
export function canManageSite(user, site) {
  if (!user || !site) return false;
  if (user.role === 'superadmin') return true;
  if (user.role === 'builder') return Boolean(site.builderId?.equals(user._id));
  if (user.role === 'siteowner') return Boolean(user.siteId?.equals(site._id));
  return false;
}
