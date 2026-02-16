type LangSuffix = '_en' | '_pt';

const LANG_SUFFIX_MAP: Record<string, LangSuffix> = {
  en: '_en',
  pt: '_pt',
};

/**
 * Given a DB record and a target language, return the localized value
 * for a given field. Falls back to the Hebrew (base) value.
 */
export function localizeField(record: any, field: string, lang?: string): string {
  if (!lang || lang === 'he') return record[field] ?? '';
  const suffix = LANG_SUFFIX_MAP[lang];
  if (!suffix) return record[field] ?? '';
  const localizedValue = record[`${field}${suffix}`];
  return localizedValue || record[field] || '';
}

/**
 * Localize multiple fields on a record, returning a new object
 * with the base field names mapped to the localized values.
 */
export function localizeRecord<T extends Record<string, any>>(
  record: T,
  fields: string[],
  lang?: string,
): T {
  if (!lang || lang === 'he') return record;
  const result = { ...record };
  for (const field of fields) {
    (result as any)[field] = localizeField(record, field, lang);
  }
  return result;
}

/**
 * Extract the language from a request query parameter.
 */
export function getLangFromQuery(query: any): string | undefined {
  const lang = query?.lang as string | undefined;
  if (lang && ['he', 'en', 'pt'].includes(lang)) return lang;
  return undefined;
}
