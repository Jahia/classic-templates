import { describe, expect, it } from "vitest";
import { dependencyFor, toNavItems, type ResolvedEntry } from "./customMenu.js";

const resolvers = {
  urlOf: (id: string) => `/url/${id}`,
  nodeOf: () => undefined,
};

describe("toNavItems", () => {
  it("maps sections to labels, links to addresses and keeps the promotion of top-level items only", () => {
    const entries: ResolvedEntry[] = [
      {
        id: "s", kind: "section", label: "Products", targetId: null,
        promotion: { title: "New kits", linkLabel: "See", targetId: "p9" },
        children: [
          { id: "a", kind: "page", label: "Sensors", targetId: "p1", children: null },
          { id: "b", kind: "externalLink", label: "Shop", url: "https://shop.example", newTab: true },
        ],
      },
      { id: "c", kind: "internalLink", label: "News", targetId: "p2", promotion: { title: "Read", targetId: null, url: null } },
    ];
    const [section, news] = toNavItems(entries, resolvers);
    expect(section.href).toBeUndefined();
    expect(section.promoData).toEqual({ title: "New kits", text: undefined, image: undefined, imageAlt: undefined, linkLabel: "See", href: "/url/p9" });
    expect(section.children.map((c) => [c.title, c.href, c.newTab])).toEqual([
      ["Sensors", "/url/p1", false],
      ["Shop", "https://shop.example", true],
    ]);
    expect(section.children[0].promoData).toBeUndefined();
    expect(news.promoData?.href).toBe("/url/p2");
  });
});

describe("dependencyFor", () => {
  it("maps a subtree entry to a regular expression and anything else to a path", () => {
    expect(dependencyFor("/sites/a.b/menus/main/*")).toEqual({ flushOnPathMatchingRegexp: String.raw`/sites/a\.b/menus/main(/.*)?` });
    expect(dependencyFor("/sites/a/home")).toEqual({ path: "/sites/a/home" });
  });
});
