const MAX_TEXT = 300;
const MAX_TEXTAREA = 5000;
const MAX_LIST_ITEMS = 50;

export class ContentError extends Error {}

function checkString(value, label, max) {
  if (typeof value !== 'string') throw new ContentError(`${label} must be text`);
  if (value.length > max) throw new ContentError(`${label} must be at most ${max} characters`);
  return value;
}

function checkImage(value, label, siteId) {
  const image = checkString(value, label, MAX_TEXT);
  // Only this site's uploads: an outside URL could track visitors, and another site's is not theirs.
  const ownUpload = new RegExp(`^/uploads/${siteId}/[a-f0-9]{32}\\.(jpg|png|webp)$`);
  if (image && !ownUpload.test(image)) {
    throw new ContentError(`${label} must be an image uploaded to this site`);
  }
  return image;
}

function checkColor(value, label) {
  if (typeof value !== 'string' || !/^#[0-9a-f]{3,8}$/i.test(value)) {
    throw new ContentError(`${label} must be a colour like #0b6b3a`);
  }
  return value;
}

function checkLink(value, label) {
  const link = checkString(value, label, MAX_TEXT);
  // Blocks javascript: links, which would run an owner's script in a visitor's browser.
  if (link && !/^(#|\/(?!\/)|https?:\/\/)/i.test(link)) {
    throw new ContentError(`${label} must start with #, / or https://`);
  }
  return link;
}

function checkValue(type, value, label, siteId) {
  if (type === 'text') return checkString(value, label, MAX_TEXT);
  if (type === 'textarea') return checkString(value, label, MAX_TEXTAREA);
  if (type === 'image') return checkImage(value, label, siteId);
  if (type === 'color') return checkColor(value, label);
  throw new ContentError(`${label} has an unknown field type`);
}

function checkList(field, value, siteId) {
  if (!Array.isArray(value)) throw new ContentError(`${field.label} must be a list`);
  if (value.length > MAX_LIST_ITEMS) {
    throw new ContentError(`${field.label} can have at most ${MAX_LIST_ITEMS} items`);
  }

  return value.map((item) => {
    if (!item || typeof item !== 'object') throw new ContentError(`${field.label} has a bad item`);

    // Reads only the template's keys, so extra keys in a request are dropped.
    const clean = {};
    for (const [key, type] of Object.entries(field.itemFields)) {
      const itemValue = item[key] ?? '';
      const label = `${field.label}: ${key}`;
      clean[key] = key === 'href'
        ? checkLink(itemValue, label)
        : checkValue(type, itemValue, label, siteId);
    }
    return clean;
  });
}

// Built from the template, never from the request, so a browser can't add fields or change labels.
export function sanitizeContent(templateContent, incoming, current, siteId) {
  const findSection = (content, key) => content?.sections?.find?.((section) => section?.key === key);

  const sections = templateContent.sections.map((section) => {
    const fields = {};

    for (const [key, field] of Object.entries(section.fields)) {
      // A field left out of the request keeps its saved value.
      const value =
        findSection(incoming, section.key)?.fields?.[key]?.value ??
        findSection(current, section.key)?.fields?.[key]?.value ??
        field.value;

      fields[key] = {
        ...field,
        value: field.type === 'list'
          ? checkList(field, value, siteId)
          : checkValue(field.type, value, field.label, siteId),
      };
    }

    return { ...section, fields };
  });

  return { sections };
}
