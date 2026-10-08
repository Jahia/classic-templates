import { buildNodeUrl, getChildNodes, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { readString as str } from "./props.js";
import { pathRegex } from "./query.js";
import { titleOf } from "./title.js";
import { isSafeExternalUrl } from "./urls.js";

/** One entry of the main menu. `href` is undefined for a menu label (jnt:navMenuText). */
export interface NavItem {
  id: string;
  title: string;
  href?: string;
  children: NavItem[];
}

/** Marked "noIndex" by Jahia's sitemap module; false when that module is not installed. */
const noIndex = (node: JCRNodeWrapper): boolean => {
  try {
    return node.isNodeType("jseomix:noIndex");
  } catch {
    return false;
  }
};

const hiddenFromNav = (node: JCRNodeWrapper): boolean =>
  node.hasProperty("ctplHideFromNav") && node.getProperty("ctplHideFromNav").getBoolean();

/**
 * Title and URL of a menu item, for the four item types Jahia offers under a page:
 * a page, a menu label (no link), a link to another node, and an external link (whose URL must
 * use an allow-listed scheme, otherwise the item becomes a plain label). A title not translated
 * yet shows in the site's default language; the system name is the last resort.
 */
const describe = (
  node: JCRNodeWrapper,
  renderContext: RenderContext,
): { title: string; href?: string } => {
  const title = titleOf(node);
  if (node.isNodeType("jnt:page"))
    return { title: title ?? node.getName(), href: buildNodeUrl(node) };
  if (node.isNodeType("jnt:nodeLink")) {
    try {
      const target = node.getProperty("j:node").getNode() as JCRNodeWrapper;
      // The target often lives outside the home tree: declare it, or a rename leaves the menu stale.
      server.render.addCacheDependency({ node: target }, renderContext);
      return {
        title: title ?? titleOf(target) ?? target.getName(),
        href: buildNodeUrl(target),
      };
    } catch {
      return { title: title ?? node.getName() };
    }
  }
  if (node.isNodeType("jnt:externalLink")) {
    const url = str(node, "j:url")?.trim();
    return {
      title: title ?? url ?? node.getName(),
      href: url && isSafeExternalUrl(url) ? url : undefined,
    };
  }
  return { title: title ?? node.getName() };
};

/**
 * Children of `node` that belong in the menu, in the editor's order. The site map also lists the
 * pages hidden from the menu (legal notice, accessibility statement): it is the complete plan,
 * minus the pages Jahia's sitemap module marks "noIndex" (jseomix:noIndex, a thank-you page), so
 * the visitor site map and sitemap.xml agree.
 */
const menuChildren = (node: JCRNodeWrapper, includeHidden: boolean): JCRNodeWrapper[] =>
  getChildNodes(
    node,
    -1,
    0,
    (n: JCRNodeWrapper) =>
      n.isNodeType("jmix:navMenuItem") &&
      !n.isNodeType("jmix:navMenu") &&
      (includeHidden ? !noIndex(n) : !hiddenFromNav(n)),
  ) as JCRNodeWrapper[];

const build = (
  node: JCRNodeWrapper,
  depth: number,
  renderContext: RenderContext,
  includeHidden = false,
): NavItem[] =>
  menuChildren(node, includeHidden).map((child) => ({
    id: child.getIdentifier(),
    ...describe(child, renderContext),
    children: depth > 1 ? build(child, depth - 1, renderContext, includeHidden) : [],
  }));

/**
 * The main menu: the home page's children, then theirs, down to `depth` levels (1 to 3).
 *
 * Reads the page tree of the current workspace, so unpublished pages only show in edit and preview.
 * Declares a cache dependency on the whole tree under home, so adding, renaming, reordering or
 * hiding a page refreshes the cached header.
 */
export const buildMainNavigation = (
  home: JCRNodeWrapper,
  depth: number,
  renderContext: RenderContext,
): NavItem[] => {
  server.render.addCacheDependency(
    { flushOnPathMatchingRegexp: `${pathRegex(home.getPath())}(/.*)?` },
    renderContext,
  );
  return build(home, Math.min(Math.max(Math.trunc(depth) || 3, 1), 3), renderContext);
};

/**
 * The site map: every page under home, hidden-from-menu pages included, down to `depth` levels
 * (1 to 10). Same item types and cache dependency as the main menu.
 */
export const buildSiteMap = (
  home: JCRNodeWrapper,
  depth: number,
  renderContext: RenderContext,
): NavItem[] => {
  server.render.addCacheDependency(
    { flushOnPathMatchingRegexp: `${pathRegex(home.getPath())}(/.*)?` },
    renderContext,
  );
  return build(home, Math.min(Math.max(Math.trunc(depth) || 5, 1), 10), renderContext, true);
};
