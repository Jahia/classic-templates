import { buildNodeUrl, getChildNodes, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { isSafeExternalUrl } from "./resolveLink.js";

/** One entry of the main menu. `href` is undefined for a menu label (jnt:navMenuText). */
export interface NavItem {
  id: string;
  title: string;
  href?: string;
  children: NavItem[];
}

const str = (node: JCRNodeWrapper, name: string): string | undefined =>
  node.hasProperty(name) ? node.getProperty(name).getString() || undefined : undefined;

const hiddenFromNav = (node: JCRNodeWrapper): boolean =>
  node.hasProperty("ctplHideFromNav") && node.getProperty("ctplHideFromNav").getBoolean();

/**
 * Title and URL of a menu item, for the four item types Jahia offers under a page:
 * a page, a menu label (no link), a link to another node, and an external link (whose URL must
 * use an allow-listed scheme, otherwise the item becomes a plain label).
 */
const describe = (node: JCRNodeWrapper): { title: string; href?: string } => {
  const title = str(node, "jcr:title");
  if (node.isNodeType("jnt:page"))
    return { title: title ?? node.getName(), href: buildNodeUrl(node) };
  if (node.isNodeType("jnt:nodeLink")) {
    try {
      const target = node.getProperty("j:node").getNode() as JCRNodeWrapper;
      return {
        title: title ?? str(target, "jcr:title") ?? target.getName(),
        href: buildNodeUrl(target),
      };
    } catch {
      return { title: title ?? node.getName() };
    }
  }
  if (node.isNodeType("jnt:externalLink")) {
    const url = str(node, "j:url");
    return {
      title: title ?? url ?? node.getName(),
      href: url && isSafeExternalUrl(url) ? url : undefined,
    };
  }
  return { title: title ?? node.getName() };
};

/** Children of `node` that belong in the menu, in the editor's order. */
const menuChildren = (node: JCRNodeWrapper): JCRNodeWrapper[] =>
  getChildNodes(
    node,
    -1,
    0,
    (n: JCRNodeWrapper) =>
      n.isNodeType("jmix:navMenuItem") && !n.isNodeType("jmix:navMenu") && !hiddenFromNav(n),
  ) as JCRNodeWrapper[];

const build = (node: JCRNodeWrapper, depth: number): NavItem[] =>
  menuChildren(node).map((child) => ({
    id: child.getIdentifier(),
    ...describe(child),
    children: depth > 1 ? build(child, depth - 1) : [],
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
    { flushOnPathMatchingRegexp: `${home.getPath()}(/.*)?` },
    renderContext,
  );
  return build(home, Math.min(Math.max(Math.trunc(depth) || 3, 1), 3));
};
