// Moves a site's content into another template's sections.
// A "rule" says: the value at [section, field] goes to [section, field], optionally converted.
// Only values the owner actually changed move, so the old template's sample text never shows up.

const findSection = (content, key) => content?.sections?.find?.((section) => section?.key === key);
const fieldOf = (content, [sectionKey, fieldKey]) => findSection(content, sectionKey)?.fields?.[fieldKey];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function moveContent({ fromContent, fromDefaults, toBase, rules }) {
  const content = structuredClone(toBase);
  const moved = new Set();
  const handled = new Set();

  for (const { from, to, convert = (value) => value } of rules) {
    const oldValue = fieldOf(fromContent, from)?.value;
    if (oldValue === undefined || same(oldValue, fieldOf(fromDefaults, from)?.value)) continue;

    const target = fieldOf(content, to);
    if (!target) continue;

    target.value = convert(structuredClone(oldValue));
    handled.add(from.join('.'));
    moved.add(findSection(content, to[0]).label);
  }

  // Filled-in fields with no place in the new sections; the caller keeps them in the archive.
  const keptAside = new Set();
  for (const section of fromContent?.sections ?? []) {
    for (const [fieldKey, field] of Object.entries(section.fields ?? {})) {
      const defaultValue = findSection(fromDefaults, section.key)?.fields?.[fieldKey]?.value;
      if (!handled.has(`${section.key}.${fieldKey}`) && !same(field?.value, defaultValue)) {
        keptAside.add(section.label);
      }
    }
  }

  return { content, moved: [...moved], keptAside: [...keptAside] };
}

// Every template now shares the same sections, so each field simply moves to the same place.
const sameKeyRules = (content) =>
  (content?.sections ?? []).flatMap((section) =>
    Object.keys(section.fields ?? {}).map((fieldKey) => ({ from: [section.key, fieldKey], to: [section.key, fieldKey] }))
  );

export function switchTemplateContent({ fromSlug, fromDefaults, fromContent, toDefaults, archive = {} }) {
  const result = moveContent({ fromContent, fromDefaults, toBase: toDefaults, rules: sameKeyRules(fromContent) });
  // A safety copy of what the site had before, in case anything didn't fit.
  return { ...result, archive: { ...archive, [fromSlug]: structuredClone(fromContent) } };
}
