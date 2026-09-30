import { describe, expect, it } from "vitest";
import { buildGraph, jsonForScript } from "./schema.js";

const base = {
  url: "https://example.org/sites/x/home/about.html",
  homeUrl: "https://example.org/sites/x/home.html",
  siteName: "Example",
  language: "en",
};

type Node = Record<string, unknown>;
const byType = (graph: Record<string, unknown>, type: string) =>
  (graph["@graph"] as Node[]).find((node) => node["@type"] === type);

describe("buildGraph", () => {
  it("describes every page as a WebPage of the WebSite published by the Organization", () => {
    const graph = buildGraph({ ...base, name: "About", description: "Who we are" });
    expect(graph["@context"]).toBe("https://schema.org");
    expect(byType(graph, "Organization")).toMatchObject({
      "@id": `${base.homeUrl}#organization`,
      "name": "Example",
    });
    expect(byType(graph, "WebSite")).toMatchObject({
      publisher: { "@id": `${base.homeUrl}#organization` },
    });
    expect(byType(graph, "WebPage")).toEqual({
      "@type": "WebPage",
      "@id": base.url,
      "url": base.url,
      "name": "About",
      "description": "Who we are",
      "inLanguage": "en",
      "isPartOf": { "@id": `${base.homeUrl}#website` },
    });
    expect(byType(graph, "BreadcrumbList")).toBeUndefined();
  });

  it("adds the BreadcrumbList of the visible trail, the current page last", () => {
    const graph = buildGraph({
      ...base,
      breadcrumb: [{ name: "Home", url: base.homeUrl }, { name: "About" }],
    });
    expect(byType(graph, "WebPage")?.breadcrumb).toEqual({ "@id": `${base.url}#breadcrumb` });
    expect(byType(graph, "BreadcrumbList")?.itemListElement).toEqual([
      { "@type": "ListItem", "position": 1, "name": "Home", "item": base.homeUrl },
      { "@type": "ListItem", "position": 2, "name": "About", "item": base.url },
    ]);
  });

  it("describes a news item as the NewsArticle the page is about", () => {
    const graph = buildGraph({
      ...base,
      editorial: {
        kind: "news",
        headline: "x".repeat(130),
        description: "Teaser",
        datePublished: "2026-09-28T09:00:00.000+02:00",
        image: "https://example.org/files/a.jpg",
        keywords: ["release"],
      },
    });
    const article = byType(graph, "NewsArticle");
    expect(byType(graph, "WebPage")?.mainEntity).toEqual({ "@id": `${base.url}#article` });
    expect((article?.headline as string).length).toBe(110);
    expect(article).toMatchObject({
      author: { "@id": `${base.homeUrl}#organization` },
      image: ["https://example.org/files/a.jpg"],
      mainEntityOfPage: { "@id": base.url },
      keywords: ["release"],
    });
  });

  it("names the WebSite after the site and the Organization after the header brand", () => {
    const graph = buildGraph({ ...base, organizationName: "E-HYPER" });
    expect(byType(graph, "WebSite")?.name).toBe("Example");
    expect(byType(graph, "Organization")?.name).toBe("E-HYPER");
  });

  it("keeps one Organization id across languages", () => {
    const fr = buildGraph({
      ...base,
      homeUrl: "https://example.org/fr/sites/x/home.html",
      organizationUrl: base.homeUrl,
    });
    expect(byType(fr, "Organization")?.["@id"]).toBe(`${base.homeUrl}#organization`);
    expect(byType(fr, "WebSite")?.["@id"]).toBe("https://example.org/fr/sites/x/home.html#website");
  });

  it("credits an article to its author", () => {
    const graph = buildGraph({
      ...base,
      editorial: { kind: "article", headline: "H", author: "Ada Martin" },
    });
    expect(byType(graph, "Article")?.author).toEqual({ "@type": "Person", "name": "Ada Martin" });
  });
});

describe("jsonForScript", () => {
  it("never lets a value close the script element", () => {
    const json = jsonForScript({ name: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});
