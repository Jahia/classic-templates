import { describe, expect, it } from "vitest";
import browse from "./__fixtures__/search-browse.json";
import filtered from "./__fixtures__/search-filtered.json";
import suggest from "./__fixtures__/search-suggest.json";
import words from "./__fixtures__/search-words.json";
import type { QueryContext } from "./searchQuery.js";
import {
  adaptSearchData,
  adaptSuggestions,
  categorySegments,
  safeHref,
  topicEntries,
} from "./searchResponse.js";
import { emptyState, type SearchState } from "./searchState.js";

const ctx: QueryContext = {
  language: "en",
  workspace: "LIVE",
  sites: ["orvane-signal", "orvane-live"],
  size: 3,
};
const state = (patch: Partial<SearchState>): SearchState => ({ ...emptyState(), ...patch });

describe("categorySegments", () => {
  it("reads the key and title of every level", () => {
    expect(
      categorySegments("orvane###orvane/ai###AI and automation/rights-ethics###Rights and ethics"),
    ).toEqual([
      { key: "orvane", label: "orvane" },
      { key: "ai", label: "AI and automation" },
      { key: "rights-ethics", label: "Rights and ethics" },
    ]);
  });

  it("does not cut a title that holds a slash", () => {
    expect(categorySegments("orvane###orvane/ai###AI/ML and more")).toEqual([
      { key: "orvane", label: "orvane" },
      { key: "ai", label: "AI/ML and more" },
    ]);
  });

  it("ignores a value that is not a category path", () => {
    expect(categorySegments("plain")).toEqual([]);
  });
});

describe("adaptSearchData: browsing (no words, no filter)", () => {
  const page = adaptSearchData(browse, emptyState(), ctx);

  it("lists no result and counts every facet", () => {
    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
    expect(page.totalPages).toBe(0);
    expect(page.facets.tag[0]).toEqual({ value: "fast", count: 7 });
    expect(page.facets.site).toEqual([
      { value: "orvane-signal", count: 82 },
      { value: "orvane-live", count: 65 },
    ]);
  });

  it("gives the types of the content, in the page's order, from the node type counts", () => {
    expect(page.facets.type).toEqual([
      { value: "story", count: 30 },
      { value: "session", count: 22 },
      { value: "person", count: 14 },
      { value: "page", count: 74 },
    ]);
  });

  it("builds the topic tree below the root, parents before children, siblings by count", () => {
    const topics = page.facets.topic;
    expect(topics.some((topic) => topic.value === "orvane")).toBe(false);
    const streaming = topics.findIndex((topic) => topic.value === "streaming");
    expect(topics[streaming]).toMatchObject({
      label: "Streaming and distribution",
      parent: undefined,
    });
    expect(topics[streaming + 1]).toMatchObject({
      parent: "streaming",
      label: "Free ad-supported channels",
    });
    expect(topics.filter((topic) => !topic.parent).map((topic) => topic.count)).toEqual(
      topics
        .filter((topic) => !topic.parent)
        .map((topic) => topic.count)
        .sort((a, b) => b - a),
    );
  });

  it("has no format until the properties are facetable and indexed", () => {
    expect(page.facets.format).toEqual([]);
  });
});

describe("adaptSearchData: words", () => {
  const page = adaptSearchData(words, state({ q: "fast" }), ctx);

  it("reads the hits, the total and the number of pages", () => {
    expect(page.total).toBe(13);
    expect(page.totalPages).toBe(5);
    expect(page.items).toHaveLength(3);
    expect(page.items[0]).toMatchObject({
      title: "Ad fill rates on free streaming channels climb to 71%",
      url: "/sites/orvane-signal/contents/stories/fast-ad-fill-rates-climb.html",
      type: "ctmd:story",
    });
    expect(page.items[0]?.excerpt).toContain("<em>");
    expect(page.items[0]?.date).toMatch(/^2026-/);
  });
});

describe("adaptSearchData: filters", () => {
  const selected = state({
    tag: ["carbon", "icvfx"],
    topic: ["production", "streaming/fast-channels"],
    type: ["story"],
    site: ["orvane-signal"],
  });
  const page = adaptSearchData(filtered, selected, ctx);

  it("reads each selected facet from its own search, so its values are counted without it", () => {
    expect(page.facets.tag[0]).toEqual({ value: "fast", count: 5 });
    expect(page.total).toBe(1);
    expect(page.facets.type).toEqual([{ value: "story", count: 1 }]);
  });

  it("keeps a selected value that no bucket carries, at count 0", () => {
    const tags = page.facets.tag.filter((tag) => ["carbon", "icvfx"].includes(tag.value));
    expect(tags.length).toBe(2);
    expect(tags.every((tag) => tag.count === 0 || tag.count > 0)).toBe(true);
    const topics = adaptSearchData({}, state({ topic: ["a/b"] }), ctx).facets.topic;
    expect(topics).toEqual([{ value: "a/b", count: 0, label: "b", parent: "a" }]);
  });
});

describe("topicEntries", () => {
  it("reads only the root with the most items and ignores another tree", () => {
    const entries = topicEntries(
      [
        { value: "main###main", count: 10 },
        { value: "main###main/a###A", count: 6 },
        { value: "other###other", count: 3 },
        { value: "other###other/b###B", count: 3 },
      ],
      [],
    );
    expect(entries.map((entry) => entry.value)).toEqual(["a"]);
  });

  it("drops a key that is not a valid topic segment", () => {
    expect(
      topicEntries(
        [
          { value: "r###r", count: 1 },
          { value: "r###r/a b###X", count: 1 },
        ],
        [],
      ),
    ).toEqual([]);
  });
});

describe("adaptSearchData: format", () => {
  it("merges story formats and session types, known values only, selected ones always", () => {
    const data = {
      by_format: {
        format: {
          data: [
            { value: "news", count: 4 },
            { value: "bogus", count: 9 },
          ],
        },
        sessionType: { data: [{ value: "keynote", count: 6 }] },
      },
    };
    expect(adaptSearchData(data, state({ format: ["video"] }), ctx).facets.format).toEqual([
      { value: "keynote", count: 6 },
      { value: "news", count: 4 },
      { value: "video", count: 0 },
    ]);
  });
});

describe("robustness", () => {
  it("returns an empty page for an answer without data", () => {
    const page = adaptSearchData(null, emptyState(), ctx);
    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
    expect(page.facets.tag).toEqual([]);
  });

  it("only follows addresses that are safe", () => {
    expect(safeHref("/sites/a/b.html")).toBe("/sites/a/b.html");
    expect(safeHref("https://example.com/x")).toBe("https://example.com/x");
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("//evil.example")).toBeUndefined();
    expect(safeHref(undefined)).toBeUndefined();
  });
});

describe("adaptSuggestions", () => {
  it("gives the titles first, then the tags that contain the words", () => {
    const suggestions = adaptSuggestions(suggest, "car");
    const titles = suggestions.filter((entry) => entry.kind === "result");
    const tags = suggestions.filter((entry) => entry.kind === "tag");
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.length).toBeLessThanOrEqual(5);
    expect(tags.length).toBeLessThanOrEqual(3);
    expect(tags.every((entry) => entry.value.includes("car"))).toBe(true);
    expect(suggestions.indexOf(tags[0] ?? titles[0])).toBeGreaterThanOrEqual(titles.length - 1);
  });

  it("offers no tag for empty words and nothing for an empty answer", () => {
    expect(adaptSuggestions(suggest, " ").some((entry) => entry.kind === "tag")).toBe(false);
    expect(adaptSuggestions({}, "x")).toEqual([]);
  });
});
