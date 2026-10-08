import { Island, buildNodeUrl, jahiaComponent, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { JCRSiteNode } from "org.jahia.services.content.decorator";
import type { RenderContext } from "org.jahia.services.render";
import { accountUrls } from "../../../lib/account.js";
import { asSystem, guestCanRead } from "../../../lib/access.js";
import { chromeOwner, pageSite } from "../../../lib/site.js";
import Account from "./Account.client.jsx";
import type { Props } from "./types.js";

/**
 * Where to send the visitor after signing in: the page the editor picked, else the page being
 * viewed.
 *
 * The picked page is often one a guest cannot read (a members area is the typical case), so it is
 * looked up in a system session: the address is what the editor chose to put in a public link, and
 * the answer must not depend on who renders the cached header first (a guest-rendered header
 * would otherwise lose the destination). A page that is deleted or not published yet falls back to
 * the page being viewed.
 */
const landingUrl = (
  header: JCRNodeWrapper,
  mainNode: JCRNodeWrapper,
  renderContext: RenderContext,
  locale: unknown,
): string => {
  if (header.hasProperty("accountLanding")) {
    const identifier = header.getProperty("accountLanding").getString();
    try {
      server.render.addCacheDependency({ uuid: identifier }, renderContext);
    } catch {
      // Not readable by the rendering user: the system lookup below still finds it.
    }
    const picked = asSystem(renderContext.getWorkspace(), locale, (session) =>
      buildNodeUrl(session.getNodeByIdentifier(identifier) as JCRNodeWrapper),
    );
    if (picked) return picked;
  }
  return buildNodeUrl(mainNode);
};

/**
 * The sign-in / sign-out entry of the header's utility bar (view "account" of the site header,
 * rendered by its default view when "Show a sign-in entry" is on).
 *
 * The HTML is the same for every visitor, whoever renders it first: it carries the guest version
 * (a "Sign in" link) and an island that asks the platform who the visitor is, so one cached
 * fragment serves guests and signed-in users alike. The URLs are Jahia's login and logout routes
 * with a site-relative `redirect` (src/lib/account.ts).
 *
 * `cache.mainResource` gives each page its own fragment, so "back to the page you were on" is
 * right on every page while the rest of the header stays one shared fragment.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctpl:siteHeader",
    name: "account",
    displayName: "Account entry",
    properties: { "cache.mainResource": "true" },
  },
  (_: Props, { currentNode, currentResource, mainNode, renderContext }) => {
    const site: JCRSiteNode = pageSite(renderContext);
    server.render.addCacheDependency({ node: mainNode }, renderContext);
    server.render.addCacheDependency({ node: currentNode }, renderContext);

    const landing = landingUrl(currentNode, mainNode, renderContext, currentResource.getLocale());
    // After signing out the visitor is a guest: send them to the page only if a guest can read it.
    const home = chromeOwner(site);
    const leaving = guestCanRead(mainNode.getPath()) ? buildNodeUrl(mainNode) : buildNodeUrl(home);
    const urls = accountUrls(renderContext.getRequest().getContextPath(), landing, leaving);

    return (
      <div data-testid="ctpl-account" data-ctpl-account>
        <Island
          component={Account}
          props={{ signInHref: urls.signIn, signOutHref: urls.signOut, graphqlUrl: urls.graphql }}
        />
      </div>
    );
  },
);
