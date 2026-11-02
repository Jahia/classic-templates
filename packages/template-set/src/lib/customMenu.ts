import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { NavItem } from "./navigation.js";

/**
 * A header menu built in jContent > Menus (the Menu Manager module), read through its GraphQL field
 * menuManager.resolvedMenu: as the visitor (what they may not read is left out), in the visitor's
 * language with the menu's fallback. No current page is sent: the header is one cached fragment
 * shared by every page, and static/js/navigation.js marks the current page in the browser.
 */
export const CUSTOM_MENU_QUERY = `
  query ClassicTemplatesHeaderMenu($menu: String!, $language: String!, $workspace: String, $maxDepth: Int) {
    menuManager {
      resolvedMenu(menu: $menu, language: $language, workspace: $workspace, maxDepth: $maxDepth) {
        dependencies
        items {
          id kind label targetId url newTab
          promotion { title text imageId imageAlt linkLabel targetId url }
          children { id kind label targetId url newTab children { id kind label targetId url newTab } }
        }
      }
    }
  }
`;

/** An item as menuManager.resolvedMenu returns it (the fields the header reads). */
export interface ResolvedEntry {
  id: string;
  kind: string;
  label: string;
  targetId?: string | null;
  url?: string | null;
  newTab?: boolean;
  promotion?: {
    title: string;
    text?: string | null;
    imageId?: string | null;
    imageAlt?: string | null;
    linkLabel?: string | null;
    targetId?: string | null;
    url?: string | null;
  } | null;
  children?: ResolvedEntry[] | null;
}

/** How the view turns identifiers into what it renders: a node's address, and a node. */
export interface Resolvers {
  urlOf: (id: string) => string | undefined;
  nodeOf: (id: string) => JCRNodeWrapper | undefined;
}

/** An item's address: none for a section, the checked address of an external link, else its target's. */
const addressOf = (entry: ResolvedEntry, resolvers: Resolvers): string | undefined => {
  if (entry.kind === "section") {
    return undefined;
  }
  if (entry.url) {
    return entry.url;
  }
  return entry.targetId ? resolvers.urlOf(entry.targetId) : undefined;
};

/**
 * The resolved items as the header's menu items: a section has no address (rendered as a label, like
 * a menu label of the page tree), an external link keeps the address the resolver checked, a top-level
 * item carries its promotion (whose button falls back to the item's own address).
 */
export const toNavItems = (entries: ResolvedEntry[] | null | undefined, resolvers: Resolvers, top = true): NavItem[] =>
  (entries ?? []).map((entry) => {
    const href = addressOf(entry, resolvers);
    const promo = top ? entry.promotion : undefined;
    return {
      id: entry.id,
      title: entry.label,
      href,
      newTab: entry.newTab === true && href !== undefined,
      children: toNavItems(entry.children, resolvers, false),
      promoData: promo
        ? {
            title: promo.title,
            text: promo.text ?? undefined,
            image: promo.imageId ? resolvers.nodeOf(promo.imageId) : undefined,
            imageAlt: promo.imageAlt ?? undefined,
            linkLabel: promo.linkLabel ?? undefined,
            href: promo.url ?? (promo.targetId ? resolvers.urlOf(promo.targetId) : href),
          }
        : undefined,
    };
  });

const escapeRegex = (text: string): string => text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** A cache dependency for one entry of the resolver's list ("/*" stands for a subtree). */
export const dependencyFor = (entry: string): { path: string } | { flushOnPathMatchingRegexp: string } =>
  entry.endsWith("/*")
    ? { flushOnPathMatchingRegexp: `${escapeRegex(entry.slice(0, -2))}(/.*)?` }
    : { path: entry };
