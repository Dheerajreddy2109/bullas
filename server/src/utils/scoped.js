// Checks operators too, because { $set: { siteId } } would move a document to another site.
function touchesSiteId(update) {
  if (Array.isArray(update)) return true;

  return Object.entries(update).some(([key, value]) => {
    if (key === 'siteId') return true;
    if (!key.startsWith('$') || !value || typeof value !== 'object') return false;
    return 'siteId' in value || (key === '$rename' && Object.values(value).includes('siteId'));
  });
}

// siteId is spread last everywhere, so a value sent by a browser can never override it.
export function scoped(Model, siteId) {
  // An undefined siteId would quietly drop the filter and match every site's documents.
  if (!siteId) {
    throw new Error('scoped() needs a siteId');
  }

  return {
    find: (filter = {}, ...rest) => Model.find({ ...filter, siteId }, ...rest),
    findOne: (filter = {}, ...rest) => Model.findOne({ ...filter, siteId }, ...rest),
    create: (data) => Model.create({ ...data, siteId }),
    updateOne: (filter, update) => {
      if (touchesSiteId(update)) {
        throw new Error('A document cannot be moved to another site');
      }
      return Model.updateOne({ ...filter, siteId }, update, { runValidators: true });
    },
    deleteOne: (filter) => Model.deleteOne({ ...filter, siteId }),
    countDocuments: (filter = {}) => Model.countDocuments({ ...filter, siteId }),
  };
}
