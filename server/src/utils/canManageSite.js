// The one permission rule for site data, so every route answers the question the same way.
export function canManageSite(user, siteId) {
  if (user?.role === 'superadmin') return true;
  if (user?.role !== 'siteowner' || !user.siteId) return false;
  return user.siteId.toString() === String(siteId);
}
