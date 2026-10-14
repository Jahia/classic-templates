/**
 * The address of a search page filtered by one tag: the search section of classic-media reads the
 * `tag` parameter as a facet value (tags are stored lower case, single-spaced). Duplicated from
 * that module on purpose: the two bundles share no code.
 */
export const tagFilterUrl = (page: string, tag: string): string => {
  const value = tag.replaceAll(/\s+/g, " ").trim().toLowerCase();
  if (!value) return page;
  return `${page}${page.includes("?") ? "&" : "?"}tag=${encodeURIComponent(value)}`;
};
