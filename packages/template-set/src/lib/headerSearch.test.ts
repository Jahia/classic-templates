import { describe, expect, it } from "vitest";
import {
  SUGGEST_QUERY,
  hitUrl,
  searchUrl,
  suggestVariables,
  suggestionsOf,
  wordsOf,
} from "./headerSearch.js";

const hit = (id: string, name: string, link: string) => ({ id, displayableName: name, link });
const answer = (...hits: unknown[]) => ({ data: { search: { results: { hits } } } });

describe("suggestionsOf", () => {
  it("reads the titles and addresses of the hits", () => {
    expect(suggestionsOf(answer(hit("1", " Fast channels ", "/sites/s/contents/a.html")))).toEqual([
      { id: "1", title: "Fast channels", url: "/sites/s/contents/a.html" },
    ]);
  });

  it("keeps five at most and none twice", () => {
    const many = Array.from({ length: 9 }, (_, i) => hit(String(i % 7), `T${i}`, `/p/${i}.html`));
    const found = suggestionsOf(answer(...many));
    expect(found).toHaveLength(5);
    expect(new Set(found.map((s) => s.id)).size).toBe(5);
  });

  it("drops a hit without title, id or a safe address", () => {
    expect(
      suggestionsOf(
        answer(
          hit("1", "", "/a.html"),
          hit("", "No id", "/a.html"),
          hit("2", "Script", "javascript:alert(1)"),
          hit("3", "Protocol relative", "//evil.example/x"),
          hit("4", "Fine", "https://example.com/x"),
          null,
          { id: "5", displayableName: 7, link: "/x" },
        ),
      ),
    ).toEqual([{ id: "4", title: "Fine", url: "https://example.com/x" }]);
  });

  it("gives nothing for an answer without the search field (no Augmented Search), an error or junk", () => {
    expect(
      suggestionsOf({ errors: [{ message: "Cannot query field search" }], data: null }),
    ).toEqual([]);
    expect(suggestionsOf({ data: {} })).toEqual([]);
    expect(suggestionsOf(null)).toEqual([]);
    expect(suggestionsOf("x")).toEqual([]);
    expect(suggestionsOf({ data: { search: { results: { hits: "no" } } } })).toEqual([]);
  });
});

describe("the query", () => {
  it("never holds the words: they are variables", () => {
    expect(SUGGEST_QUERY).toContain("$q: String!");
    expect(SUGGEST_QUERY).toContain("size: 5");
    expect(suggestVariables("  fast ", ["a", "b"], "fr")).toEqual({
      q: "fast",
      sites: ["a", "b"],
      language: "fr",
      workspace: "LIVE",
    });
    expect(wordsOf("x".repeat(500))).toHaveLength(200);
  });
});

describe("searchUrl and hitUrl", () => {
  it("puts the words in the q parameter, after any query already there", () => {
    expect(searchUrl("/sites/s/home/search.html", "AI & ads")).toBe(
      "/sites/s/home/search.html?q=AI%20%26%20ads",
    );
    expect(searchUrl("/search.html?lang=fr", "fast")).toBe("/search.html?lang=fr&q=fast");
    expect(searchUrl("/search.html", "   ")).toBe("/search.html");
  });

  it("only follows site paths and http(s) addresses", () => {
    expect(hitUrl("/a.html")).toBe("/a.html");
    expect(hitUrl("http://example.com")).toBe("http://example.com");
    expect(hitUrl("data:text/html,x")).toBeUndefined();
    expect(hitUrl(undefined)).toBeUndefined();
  });
});
