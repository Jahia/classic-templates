/**
 * Addresses of jContent, the back office, for links shown to editors in Page Builder (edit mode
 * only, never to visitors).
 */

/** The jContent accordion a path of a site belongs to. */
const sectionOf = (inSite: string): { section: string; rest: string } => {
  const [first] = inSite.split("/");
  if (first === "files") return { section: "media", rest: inSite };
  if (first === "contents" || inSite === "")
    return { section: "content-folders", rest: inSite || "contents" };
  return { section: "pages", rest: inSite };
};

/**
 * The jContent address that opens `path` (a node under `/sites/<key>/`) in the accordion it belongs
 * to: content folders (`contents`, and the site itself), media (`files`), pages (everything else),
 * in `language`, under the web application's context path. Undefined for a node outside a site.
 */
export const jcontentUrl = (
  path: string,
  language: string,
  contextPath = "",
): string | undefined => {
  const match = /^\/sites\/([^/]+)\/?(.*)$/.exec(path);
  if (!match) return undefined;
  const [, siteKey, inSite] = match;
  const { section, rest } = sectionOf(inSite);
  const segments = rest.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  const prefix = contextPath.replace(/\/+$/, "");
  return `${prefix}/jahia/jcontent/${encodeURIComponent(siteKey)}/${encodeURIComponent(language)}/${section}/${segments}`;
};
