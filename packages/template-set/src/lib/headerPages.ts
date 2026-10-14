import { server } from "@jahia/javascript-modules-library";
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
