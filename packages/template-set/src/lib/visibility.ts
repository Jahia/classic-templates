/**
 * How a node's "Visibility > Content visibility by language" (`j:invalidLanguages`) splits the
 * site's languages: those it is shown in and those it is switched off in. Each list starts with the
 * site's default language, then the others by code (the site's language set has no order of its
 * own). Codes the site no longer has are ignored, so a language removed from the site raises no note.
 */
export const languageVisibility = (
  invalid: readonly string[],
  site: readonly string[],
  defaultLanguage?: string,
): { shown: string[]; hidden: string[] } => {
  const off = new Set(invalid);
  const rank = (code: string) => (code === defaultLanguage ? 0 : 1);
  const ordered = [...site].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return {
    shown: ordered.filter((code) => !off.has(code)),
    hidden: ordered.filter((code) => off.has(code)),
  };
};
