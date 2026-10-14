import type { RequestState } from "@elastic/search-ui";
import { describe, expect, it, vi } from "vitest";
import browse from "./__fixtures__/search-browse.json";
import suggest from "./__fixtures__/search-suggest.json";
import words from "./__fixtures__/search-words.json";
import {
  createSearchConnector,
  pageFromResponse,
  requestFromState,
  searchKey,
  stateFromRequest,
  suggestionsFromResponse,
} from "./searchConnector.js";
import type { QueryContext } from "./searchQuery.js";
import { adaptSearchData } from "./searchResponse.js";
import { emptyState } from "./searchState.js";

const context: QueryContext = {
  language: "fr",
  workspace: "LIVE",
  sites: ["orvane-signal", "orvane-live"],
  size: 3,
};

const answer = (data: unknown, init: { ok?: boolean; status?: number } = {}) =>
  vi.fn(async () => ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => ({ data }),
  })) as unknown as typeof fetch & ReturnType<typeof vi.fn>;

const request = (patch: Partial<RequestState>): RequestState => ({
  searchTerm: "",
  current: 1,
  resultsPerPage: 3,
  filters: [],
  ...patch,
});

describe("requests and states", () => {
  it("converts a state to a Search UI request and back", () => {
    const state = {
      ...emptyState(),
      q: "fast",
      page: 2,
      tag: ["carbon", "icvfx"],
      topic: ["streaming/fast-channels"],
    };
    const asked = requestFromState(state, 10);
    expect(asked.filters).toEqual([
      { field: "topic", type: "any", values: ["streaming/fast-channels"] },
      { field: "tag", type: "any", values: ["carbon", "icvfx"] },
    ]);
    expect(stateFromRequest(asked)).toEqual(state);
  });

  it("drops unknown fields and invalid values of a request", () => {
    const state = stateFromRequest(
      request({
        searchTerm: "  x  ",
        current: 99_999,
        filters: [
          { field: "colour", type: "any", values: ["red"] },
          { field: "format", type: "any", values: ["news", "nope", { name: "r" }] },
        ],
      }),
    );
    expect(state.q).toBe("x");
    expect(state.page).toBe(1);
    expect(state.format).toEqual(["news"]);
  });
});

describe("onSearch", () => {
  it("posts the query and its variables as JSON, with the visitor's cookies", async () => {
    const fetchImpl = answer(words);
    const connector = createSearchConnector({ endpoint: "/modules/graphql", context, fetchImpl });
    const response = await connector.onSearch(request({ searchTerm: "fast" }), {});
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/modules/graphql");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("same-origin");
    const sent = JSON.parse(init.body as string) as {
      query: string;
      variables: Record<string, unknown>;
    };
    expect(sent.variables).toMatchObject({ q: "fast", language: "fr", workspace: "LIVE", size: 3 });
    expect(sent.query).not.toContain("fast");
    expect(response.totalResults).toBe(13);
    expect(response.totalPages).toBe(5);
    expect(response.results).toHaveLength(3);
    expect(response.results[0]).toMatchObject({
      title: { raw: "Ad fill rates on free streaming channels climb to 71%" },
      type: { raw: "ctmd:story" },
    });
  });

  it("shapes the facets the way Search UI does", async () => {
    const connector = createSearchConnector({
      endpoint: "/g",
      context,
      fetchImpl: answer(browse),
    });
    const response = await connector.onSearch(request({}), {});
    const tag = response.facets.tag as { field: string; type: string; data: { value: string }[] }[];
    expect(tag[0]).toMatchObject({ field: "tag", type: "value" });
    expect(tag[0]?.data[0]?.value).toBe("fast");
    expect(Object.keys(response.facets)).toEqual(["topic", "tag", "format", "type", "site"]);
  });

  it("round-trips through pageFromResponse", async () => {
    const connector = createSearchConnector({
      endpoint: "/g",
      context,
      fetchImpl: answer(words),
    });
    const response = await connector.onSearch(request({ searchTerm: "fast" }), {});
    const page = pageFromResponse(response);
    expect(page.items[0]).toMatchObject({
      title: "Ad fill rates on free streaming channels climb to 71%",
      url: "/sites/orvane-signal/contents/stories/fast-ad-fill-rates-climb.html",
    });
    expect(page.total).toBe(13);
    expect(page.facets.tag[0]).toEqual({ value: "fast", count: 7 });
  });

  it("uses the answer the server read, once, for the page's own state", async () => {
    const fetchImpl = answer(words);
    const state = { ...emptyState(), q: "fast" };
    const connector = createSearchConnector({
      endpoint: "/g",
      context,
      fetchImpl,
      primed: { key: searchKey(state, 3), page: adaptSearchData(words, state, context) },
    });
    const first = await connector.onSearch(requestFromState(state, 3), {});
    expect(first.totalResults).toBe(13);
    expect(fetchImpl).not.toHaveBeenCalled();
    await connector.onSearch(requestFromState(state, 3), {});
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("does not use the primed answer for another state", async () => {
    const fetchImpl = answer(words);
    const connector = createSearchConnector({
      endpoint: "/g",
      context,
      fetchImpl,
      primed: {
        key: searchKey(emptyState(), 3),
        page: adaptSearchData(browse, emptyState(), context),
      },
    });
    await connector.onSearch(request({ searchTerm: "fast" }), {});
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("fails when the server errs or Augmented Search is missing", async () => {
    const down = createSearchConnector({
      endpoint: "/g",
      context,
      fetchImpl: answer(null, { ok: false, status: 500 }),
    });
    await expect(down.onSearch(request({ searchTerm: "x" }), {})).rejects.toThrow("500");
    const missing = createSearchConnector({ endpoint: "/g", context, fetchImpl: answer(null) });
    await expect(missing.onSearch(request({ searchTerm: "x" }), {})).rejects.toThrow(
      "not available",
    );
  });
});

describe("onAutocomplete", () => {
  it("asks nothing for fewer than two characters", async () => {
    const fetchImpl = answer(suggest);
    const connector = createSearchConnector({ endpoint: "/g", context, fetchImpl });
    const response = await connector.onAutocomplete(request({ searchTerm: "c" }), {});
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(response.autocompletedResults).toEqual([]);
  });

  it("gives result titles and matching tags", async () => {
    const connector = createSearchConnector({
      endpoint: "/g",
      context,
      fetchImpl: answer(suggest),
    });
    const response = await connector.onAutocomplete(request({ searchTerm: "car" }), {});
    expect(response.autocompletedResults.length).toBeGreaterThan(0);
    expect(response.autocompletedResults.length).toBeLessThanOrEqual(5);
    const suggestions = suggestionsFromResponse(response);
    expect(suggestions[0]?.kind).toBe("result");
    expect(suggestions.some((entry) => entry.kind === "tag")).toBe(true);
  });
});
