import { describe, expect, it } from "vitest";
import {
  buildSearchQuery,
  buildSuggestQuery,
  filtersFor,
  topicFilter,
  type QueryContext,
} from "./searchQuery.js";
import { emptyState, type SearchState } from "./searchState.js";

const ctx: QueryContext = {
  language: "en",
  workspace: "LIVE",
  sites: ["orvane-signal", "orvane-live"],
  size: 10,
};

const state = (patch: Partial<SearchState>): SearchState => ({ ...emptyState(), ...patch });

describe("topicFilter", () => {
  it("matches a category and what is under it, whatever the root", () => {
    expect(topicFilter("streaming")).toBe("reg:[^/]*[#]{3}[^/]*/streaming[#]{3}[^/]*(/.*)?");
    expect(topicFilter("streaming/fast-channels")).toBe(
      "reg:[^/]*[#]{3}[^/]*/streaming[#]{3}[^/]*/fast-channels[#]{3}[^/]*(/.*)?",
    );
  });

  it("escapes what the index would read as an operator", () => {
    expect(topicFilter("v1.2")).toContain(String.raw`/v1\.2[#]{3}`);
  });

  it("matches the stored form of a category and of its sub-category", () => {
    const pattern = new RegExp(`^${topicFilter("ai").slice(4)}$`);
    expect(pattern.test("orvane###orvane/ai###AI and automation")).toBe(true);
    expect(pattern.test("orvane###orvane/ai###AI and automation/rights-ethics###Rights")).toBe(
      true,
    );
    expect(pattern.test("orvane###orvane/aim###Aim")).toBe(false);
    expect(pattern.test("orvane###orvane/business###B/ai###x")).toBe(false);
  });
});

describe("filtersFor", () => {
  it("is undefined without a selection", () => {
    expect(filtersFor(emptyState(), ctx)).toBeUndefined();
  });

  it("ORs the values of a facet in one group and ANDs the groups", () => {
    const filters = filtersFor(
      state({ tag: ["carbon", "icvfx"], type: ["story"], format: ["news", "keynote"] }),
      ctx,
    );
    expect(filters?.custom.term).toEqual([
      {
        operation: "OR",
        terms: [
          { field: "jcr:tags", value: "carbon" },
          { field: "jcr:tags", value: "icvfx" },
        ],
      },
      {
        operation: "OR",
        terms: [
          { field: "format", value: "news" },
          { field: "sessionType", value: "keynote" },
        ],
      },
      { operation: "OR", terms: [{ field: "jgql:nodeType", value: "ctmd:story" }] },
    ]);
  });

  it("leaves out the group of the facet being counted", () => {
    const selected = state({ tag: ["carbon"], type: ["story"] });
    expect(filtersFor(selected, ctx, "tag")?.custom.term).toHaveLength(1);
    expect(filtersFor(selected, ctx, "tag")?.custom.term[0]?.terms[0]?.field).toBe("jgql:nodeType");
    expect(filtersFor(state({ tag: ["carbon"] }), ctx, "tag")).toBeUndefined();
  });

  it("drops a site outside the scope", () => {
    expect(filtersFor(state({ site: ["elsewhere"] }), ctx)).toBeUndefined();
    expect(filtersFor(state({ site: ["orvane-live"] }), ctx)?.custom.term[0]?.terms).toEqual([
      { field: "jgql:originSite", value: "orvane-live" },
    ]);
  });
});

describe("buildSearchQuery", () => {
  it("only asks for the facets when nothing is asked", () => {
    const { query, variables } = buildSearchQuery(emptyState(), ctx);
    expect(query).not.toContain("results(");
    expect(query).toContain('termFacet(field: "jcr:tags"');
    expect(query).toContain('termFacet(field: "sessionType"');
    expect(variables).toEqual({
      q: "",
      sites: ["orvane-signal", "orvane-live"],
      language: "en",
      workspace: "LIVE",
    });
  });

  it("lists the results of words, ranked, with every facet counted by the main search", () => {
    const { query, variables } = buildSearchQuery(state({ q: "fast", page: 2 }), ctx);
    expect(query).toContain("results(page: $page, size: $size) {");
    expect(query).not.toContain("by_");
    expect(variables).toMatchObject({ q: "fast", page: 1, size: 10 });
    expect(variables).not.toHaveProperty("sort");
    expect(variables).not.toHaveProperty("f");
  });

  it("sorts newest first when only filters ask", () => {
    const { query, variables } = buildSearchQuery(state({ tag: ["carbon"] }), ctx);
    expect(query).toContain("sortBy: $sort");
    expect(variables.sort).toEqual([{ field: "jgql:lastPublished", dir: "DESC" }]);
  });

  it("counts a facet with a selection by its own search, without its group", () => {
    const { query, variables } = buildSearchQuery(
      state({ q: "x", tag: ["carbon"], type: ["story"] }),
      ctx,
    );
    expect(query).toContain("by_tag: search(");
    expect(query).toContain("by_type: search(");
    expect(query).toContain("filters: $f_tag");
    expect(query).toContain("filters: $f_type");
    // the tag facet is counted by by_tag only, not by the main search
    const main = query.slice(query.indexOf("main:"), query.indexOf("by_tag:"));
    expect(main).not.toContain('field: "jcr:tags"');
    expect(main).toContain('field: "jgql:categories_path"');
    expect(variables.f_tag).toEqual(filtersFor(state({ type: ["story"] }), ctx));
    expect(variables.f_type).toEqual(filtersFor(state({ tag: ["carbon"] }), ctx));
    expect(variables.f).toEqual(filtersFor(state({ tag: ["carbon"], type: ["story"] }), ctx));
  });

  it("has no filters variable for a facet counted without any other filter", () => {
    const { query, variables } = buildSearchQuery(state({ q: "x", tag: ["carbon"] }), ctx);
    expect(query).toContain(
      "by_tag: search(q: $q, siteKeys: $sites, language: $language, workspace: $workspace)",
    );
    expect(variables).not.toHaveProperty("f_tag");
  });

  it("never puts a visitor's value in the document", () => {
    const hostile = state({
      q: 'x") { id } } mutation { a',
      tag: ['"] }'],
      topic: ["a/b"],
    });
    const { query } = buildSearchQuery(hostile, ctx);
    expect(query).not.toContain("mutation");
    expect(query).not.toContain("a/b");
    expect(query).not.toContain('"] }');
  });
});

describe("buildSuggestQuery", () => {
  it("asks five matches and the tags, the words in a variable", () => {
    const { query, variables } = buildSuggestQuery("fas", ctx);
    expect(query).toContain("size: 5");
    expect(query).not.toContain("fas");
    expect(variables.q).toBe("fas");
  });
});
