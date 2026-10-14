import { server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { pageUrlById } from "./access.js";
import { pageWithComeBack } from "./account.js";
import { chromeOwner, pageSite } from "./site.js";

/**
 * The address of the site's registration page (site header setting "Registration page") with
 * `comeBack` as the place to return to once the account exists; undefined when the site has none,
 * or it is gone or not published yet. The header is a cache dependency: setting the page refreshes
 * the members notices that link to it.
 */
export const registerHref = (
  renderContext: RenderContext,
  locale: unknown,
  comeBack: string | undefined,
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
  if (!header.hasProperty("registerPage")) return undefined;
  const identifier = header.getProperty("registerPage").getString();
  return pageWithComeBack(pageUrlById(identifier, renderContext, locale), comeBack);
};
