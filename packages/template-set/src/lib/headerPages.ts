import { getChildNodes, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { pageUrlById } from "./access.js";
import { pageWithComeBack, safeLocalPath } from "./account.js";
import { chromeOwner, pageSite } from "./site.js";
import { tagFilterUrl } from "./tagFilter.js";

/**
 * The address of a page the site header names (registerPage, searchPage...), or undefined when the
 * site has none, or it is gone or not published yet. The header is a cache dependency: changing the
 * page refreshes every fragment that links to it.
 */
const headerPageUrl = (
  renderContext: RenderContext,
  locale: unknown,
  name: "registerPage" | "searchPage",
): string | undefined => {
  let header: JCRNodeWrapper;
  try {
    const home = chromeOwner(pageSite(renderContext));
    if (!home.hasNode("siteHeader/header")) return undefined;
    header = home.getNode("siteHeader/header");
  } catch {
    return undefined;
  }
  server.render.addCacheDependency({ node: header }, renderContext);
  if (!header.hasProperty(name)) return undefined;
  return pageUrlById(header.getProperty(name).getString(), renderContext, locale);
};

/**
 * The site's registration page (site header setting "Registration page") with `comeBack` as the
 * place to return to once the account exists; undefined when the site has none.
 */
export const registerHref = (
  renderContext: RenderContext,
  locale: unknown,
  comeBack: string | undefined,
): string | undefined =>
  pageWithComeBack(headerPageUrl(renderContext, locale, "registerPage"), comeBack);

/**
 * A function giving the search page's address filtered by one tag (`?tag=<tag>`, a facet of the
 * search section), or undefined when the site header names no search page: tags are then plain text.
 */
export const tagSearch = (
  renderContext: RenderContext,
  locale: unknown,
): ((tag: string) => string) | undefined => {
  const page = safeLocalPath(headerPageUrl(renderContext, locale, "searchPage"));
  if (!page) return undefined;
  return (tag) => tagFilterUrl(page, tag);
};

/**
 * The site's search page as a site path (site header setting "Search page"), or undefined when the
 * site has none, or it is gone or not published yet: the header's search box is then not shown.
 */
export const searchPageHref = (renderContext: RenderContext, locale: unknown): string | undefined =>
  safeLocalPath(headerPageUrl(renderContext, locale, "searchPage"));

/** The key of the site a link of the network bar points at, or undefined when it points nowhere. */
const linkedSite = (link: JCRNodeWrapper): string | undefined => {
  try {
    return link.hasProperty("j:linknode")
      ? (link.getProperty("j:linknode").getNode() as JCRNodeWrapper).getResolveSite().getName()
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The sites the header's search suggestions come from: the page's own site, then the sites the
 * network bar of the header area links to (its `ctpl:link` children), so a group of sites suggests
 * across the group. A site with no network bar, or a template set version without one, suggests
 * from its own site only. The header area is a cache dependency: editing the bar refreshes the
 * header.
 */
export const suggestionSites = (renderContext: RenderContext): string[] => {
  const site = pageSite(renderContext);
  const keys = [site.getName()];
  try {
    const area = chromeOwner(site).getNode("siteHeader");
    server.render.addCacheDependency(
      { flushOnPathMatchingRegexp: `${area.getPath()}(/.*)?` },
      renderContext,
    );
    for (const bar of getChildNodes(area, -1, 0, (n: JCRNodeWrapper) =>
      n.isNodeType("ctpl:networkBar"),
    )) {
      for (const link of getChildNodes(bar, -1, 0, (n: JCRNodeWrapper) =>
        n.isNodeType("ctpl:link"),
      )) {
        const key = linkedSite(link);
        if (key && !keys.includes(key)) keys.push(key);
      }
    }
  } catch {
    // no network bar (or no such type in this version): this site only
  }
  return keys;
};
