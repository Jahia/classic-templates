/**
 * The breadcrumb trail of a page or of a main resource (a news item, an article, any item stored
 * in a content folder), as pure functions over a small tree interface, so the rules are
 * unit-tested outside Jahia. templates/Breadcrumb.tsx gives the JCR implementation of the tree
 * and records the cache dependencies.
 *
 * - A page of the page tree: home, the titled pages above it, the page.
 * - An item outside the page tree: home, then the page that lists it, reached through the page
 *   tree, then the item. The listing page is the one named by the nearest content folder above
 *   the item (ctplmix:listingPage), so sub-folders inherit it. Without one: home, then the item.
 */

export interface Crumb {
  title: string;
  /** Undefined for the current page, the last crumb. */
  href?: string;
}

export interface Trail {
  crumbs: Crumb[];
  /**
   * True for an item outside the page tree whose folders name no listing page: its trail is home
   * then the item, and edit mode tells the editor where to set the listing page.
   */
  unlisted: boolean;
}

/** What the trail needs to know about the nodes of a site. */
export interface TrailTree<N> {
  path: (node: N) => string;
  /** The parent, or undefined above the site or when it cannot be read. */
  parent: (node: N) => N | undefined;
  /** The title in the rendering language, undefined when not translated. */
  title: (node: N) => string | undefined;
  /** The system name, shown for the current page when it has no title. */
  name: (node: N) => string;
  href: (node: N) => string;
  isPage: (node: N) => boolean;
  /** The page a content folder names as the one that lists its items, when set and readable. */
  listingPage: (folder: N) => N | undefined;
}

const isWithin = (path: string, root: string): boolean => path.startsWith(`${root}/`);

/** The titled pages strictly between the home page and `node`, home side first. */
const pagesAbove = <N>(tree: TrailTree<N>, node: N, homePath: string): N[] => {
  const pages: N[] = [];
  let parent = tree.parent(node);
  while (parent !== undefined && tree.path(parent) !== homePath) {
    if (tree.isPage(parent) && tree.title(parent)) pages.unshift(parent);
    parent = tree.parent(parent);
  }
  return pages;
};

/**
 * The listing page of `item`: the one named by the nearest folder above it whose listing page is
 * the home page or a page below it. A listing page outside the site's page tree is ignored, and
 * the search goes on with the folders above.
 */
export const listingPageOf = <N>(tree: TrailTree<N>, item: N, homePath: string): N | undefined => {
  let folder = tree.parent(item);
  while (folder !== undefined) {
    const page = tree.listingPage(folder);
    if (page !== undefined && tree.isPage(page)) {
      const pagePath = tree.path(page);
      if (pagePath === homePath || isWithin(pagePath, homePath)) return page;
    }
    folder = tree.parent(folder);
  }
  return undefined;
};

/**
 * The trail of `node`, home first, `node` last (no href). The caller decides whether a trail is
 * shown at all (never on the home page, see Breadcrumb). The home crumb reads `homeLabel` (a
 * translated "Home") when given: the home page's own title is often a long search-engine title.
 */
export const buildTrail = <N>(tree: TrailTree<N>, node: N, home: N, homeLabel?: string): Trail => {
  const homePath = tree.path(home);
  const crumb = (page: N): Crumb => ({
    title: tree.title(page) ?? tree.name(page),
    href: tree.href(page),
  });
  const first: Crumb = {
    title: homeLabel ?? tree.title(home) ?? tree.name(home),
    href: tree.href(home),
  };
  const current: Crumb = { title: tree.title(node) ?? tree.name(node) };

  if (isWithin(tree.path(node), homePath)) {
    return {
      crumbs: [first, ...pagesAbove(tree, node, homePath).map(crumb), current],
      unlisted: false,
    };
  }

  const listing = listingPageOf(tree, node, homePath);
  if (listing === undefined) return { crumbs: [first, current], unlisted: true };
  if (tree.path(listing) === homePath) return { crumbs: [first, current], unlisted: false };

  // An untitled listing page is left out, like any untitled page of the trail.
  const through = tree.title(listing) ? [listing] : [];
  const pages = [...pagesAbove(tree, listing, homePath), ...through];
  return { crumbs: [first, ...pages.map(crumb), current], unlisted: false };
};
