/**
 * Choice of the image a page shares (Open Graph, Twitter card). Pure so the order is unit-tested;
 * the view supplies the candidates, cheapest first, as lazy lookups.
 */
export interface ShareImageCandidate<T> {
  /** Where the image comes from, for the alt text rule and tests. */
  source: "seo" | "item" | "hero" | "site" | "logo";
  find: () => T | undefined;
}

/** The first candidate that resolves, in the given order, with where it came from. */
export const firstShareImage = <T>(
  candidates: ShareImageCandidate<T>[],
): { image: T; source: ShareImageCandidate<T>["source"] } | undefined => {
  for (const candidate of candidates) {
    const image = candidate.find();
    if (image !== undefined) return { image, source: candidate.source };
  }
  return undefined;
};

/** Open Graph wants language_TERRITORY ("fr_FR"); a BCP 47 tag uses a hyphen ("fr-FR"). */
export const ogLocale = (languageTag: string): string => languageTag.replace("-", "_");

/** "<page> | <site>", or the site name alone on the home page or when the page has no title. */
export const fullTitle = (title: string | undefined, siteName: string): string =>
  title && title !== siteName ? `${title} | ${siteName}` : siteName;
