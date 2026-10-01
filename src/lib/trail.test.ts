import { describe, expect, it } from "vitest";
import { type TrailTree, buildTrail, listingPageOf } from "./trail.js";

interface FakeNode {
  path: string;
  title?: string;
  page?: boolean;
  /** Path of the page this folder names as its listing page. */
  listing?: string;
}

const SITE = "/sites/demo";
const HOME = `${SITE}/home`;

/** A site as a flat list of nodes; parents are found by path, nothing is read above the site. */
const treeOf = (nodes: FakeNode[]): TrailTree<FakeNode> & { at: (path: string) => FakeNode } => {
  const byPath = new Map(nodes.map((node) => [node.path, node]));
  const at = (path: string): FakeNode => {
    const node = byPath.get(path);
    if (!node) throw new Error(`no node at ${path}`);
    return node;
  };
  return {
    at,
    path: (node) => node.path,
    parent: (node) =>
      node.path === SITE ? undefined : byPath.get(node.path.slice(0, node.path.lastIndexOf("/"))),
    title: (node) => node.title,
    name: (node) => node.path.slice(node.path.lastIndexOf("/") + 1),
    href: (node) => `${node.path}.html`,
    isPage: (node) => node.page === true,
    listingPage: (folder) => (folder.listing ? byPath.get(folder.listing) : undefined),
  };
};

const site: FakeNode[] = [
  { path: SITE, title: "Demo" },
  { path: HOME, title: "Home", page: true },
  { path: `${HOME}/about`, title: "About", page: true },
  { path: `${HOME}/about/media`, title: "Media room", page: true },
  { path: `${HOME}/untitled`, page: true },
  { path: `${HOME}/untitled/destinations`, title: "Destinations", page: true },
  { path: `${SITE}/contents` },
  { path: `${SITE}/contents/press`, listing: `${HOME}/about/media` },
  { path: `${SITE}/contents/press/2026`, title: "2026" },
  { path: `${SITE}/contents/press/2026/launch`, title: "Launch" },
  { path: `${SITE}/contents/press/2026/own`, listing: `${HOME}/about` },
  { path: `${SITE}/contents/press/2026/own/item`, title: "Own" },
  { path: `${SITE}/contents/press/release`, title: "Release" },
  { path: `${SITE}/contents/news` },
  { path: `${SITE}/contents/news/item`, title: "News item" },
  { path: `${SITE}/contents/places`, listing: `${HOME}/untitled/destinations` },
  { path: `${SITE}/contents/places/tokyo`, title: "Tokyo" },
  { path: `${SITE}/contents/home-listed`, listing: HOME },
  { path: `${SITE}/contents/home-listed/item`, title: "Listed on home" },
  { path: `${SITE}/contents/elsewhere`, listing: "/sites/other/home/news" },
  { path: `${SITE}/contents/elsewhere/item` },
  { path: `${SITE}/contents/hidden-page`, listing: `${HOME}/untitled` },
  { path: `${SITE}/contents/hidden-page/item`, title: "Under untitled" },
  { path: "/sites/other/home/news", title: "Other news", page: true },
];

const tree = treeOf(site);
const trailAt = (path: string) => buildTrail(tree, tree.at(path), tree.at(HOME));
const titles = (path: string) => trailAt(path).crumbs.map((crumb) => crumb.title);

describe("buildTrail for pages", () => {
  it("lists home, the titled pages above, then the page without a link", () => {
    expect(trailAt(`${HOME}/about/media`)).toEqual({
      crumbs: [
        { title: "Home", href: `${HOME}.html` },
        { title: "About", href: `${HOME}/about.html` },
        { title: "Media room" },
      ],
      unlisted: false,
    });
  });

  it("leaves out a page with no title in this language, and names an untitled current page", () => {
    expect(titles(`${HOME}/untitled/destinations`)).toEqual(["Home", "Destinations"]);
    expect(titles(`${HOME}/untitled`)).toEqual(["Home", "untitled"]);
  });
});

describe("buildTrail for items of content folders", () => {
  it("goes through the listing page of the item's folder and the pages above it", () => {
    expect(trailAt(`${SITE}/contents/press/release`)).toEqual({
      crumbs: [
        { title: "Home", href: `${HOME}.html` },
        { title: "About", href: `${HOME}/about.html` },
        { title: "Media room", href: `${HOME}/about/media.html` },
        { title: "Release" },
      ],
      unlisted: false,
    });
  });

  it("lets a sub-folder inherit the listing page, and a nearer folder override it", () => {
    expect(titles(`${SITE}/contents/press/2026/launch`)).toEqual([
      "Home",
      "About",
      "Media room",
      "Launch",
    ]);
    expect(titles(`${SITE}/contents/press/2026/own/item`)).toEqual(["Home", "About", "Own"]);
  });

  it("never shows the folders themselves", () => {
    expect(titles(`${SITE}/contents/places/tokyo`)).toEqual(["Home", "Destinations", "Tokyo"]);
  });

  it("falls back to home then the item, flagged as unlisted, when no folder names a page", () => {
    expect(trailAt(`${SITE}/contents/news/item`)).toEqual({
      crumbs: [{ title: "Home", href: `${HOME}.html` }, { title: "News item" }],
      unlisted: true,
    });
  });

  it("does not repeat home when the home page lists the folder", () => {
    expect(trailAt(`${SITE}/contents/home-listed/item`)).toEqual({
      crumbs: [{ title: "Home", href: `${HOME}.html` }, { title: "Listed on home" }],
      unlisted: false,
    });
  });

  it("ignores a listing page outside the site's page tree", () => {
    const trail = trailAt(`${SITE}/contents/elsewhere/item`);
    expect(trail.crumbs.map((crumb) => crumb.title)).toEqual(["Home", "item"]);
    expect(trail.unlisted).toBe(true);
  });

  it("leaves out a listing page with no title in this language", () => {
    const trail = trailAt(`${SITE}/contents/hidden-page/item`);
    expect(trail.crumbs.map((crumb) => crumb.title)).toEqual(["Home", "Under untitled"]);
    expect(trail.unlisted).toBe(false);
  });
});

describe("buildTrail home label", () => {
  it("names the home crumb with the given label, its link unchanged, on pages and items", () => {
    const seo = treeOf(
      site.map((n) => (n.path === HOME ? { ...n, title: "Flights across Asia" } : n)),
    );
    const home = seo.at(HOME);
    expect(buildTrail(seo, seo.at(`${HOME}/about/media`), home, "Home").crumbs[0]).toEqual({
      title: "Home",
      href: `${HOME}.html`,
    });
    expect(
      buildTrail(seo, seo.at(`${SITE}/contents/places/tokyo`), home, "Accueil").crumbs.map(
        (crumb) => crumb.title,
      ),
    ).toEqual(["Accueil", "Destinations", "Tokyo"]);
  });

  it("falls back to the home page's title without a label", () => {
    const seo = treeOf(
      site.map((n) => (n.path === HOME ? { ...n, title: "Flights across Asia" } : n)),
    );
    expect(buildTrail(seo, seo.at(`${HOME}/about`), seo.at(HOME)).crumbs[0].title).toBe(
      "Flights across Asia",
    );
  });
});

describe("listingPageOf", () => {
  it("finds the nearest folder's page, and nothing above the site", () => {
    expect(listingPageOf(tree, tree.at(`${SITE}/contents/press/2026/launch`), HOME)?.path).toBe(
      `${HOME}/about/media`,
    );
    expect(listingPageOf(tree, tree.at(`${SITE}/contents/news/item`), HOME)).toBeUndefined();
  });

  it("skips a folder that names a node that is not a page", () => {
    const odd = treeOf([
      ...site,
      { path: `${SITE}/contents/press/odd`, listing: `${SITE}/contents/news` },
      { path: `${SITE}/contents/press/odd/item`, title: "Odd" },
    ]);
    expect(listingPageOf(odd, odd.at(`${SITE}/contents/press/odd/item`), HOME)?.path).toBe(
      `${HOME}/about/media`,
    );
  });
});
