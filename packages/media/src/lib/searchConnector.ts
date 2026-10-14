/**
 * Our connector between Elastic Search UI (`@elastic/search-ui`, core only) and Jahia's Augmented
 * Search. It implements Search UI's `APIConnector`: `onSearch` and `onAutocomplete` post a GraphQL
 * query to the site's /modules/graphql and adapt the answer to Search UI's `ResponseState`.
 *
 * Unlike the `@jahia/search-ui-jahia-connector` (read as a reference, not used), it
 * - searches a list of sites, not one;
 * - sends every value as a GraphQL variable, never pasted into the document (searchQuery.ts);
 * - ORs the values of a facet and ANDs the facets, with counts that ignore a facet's own selection;
 * - hands the first request the server already answered back without a second round trip
 *   (`primed`).
 *
 * Only types are imported from Search UI here, so the server view can use the pure helpers of this
 * file without loading the library.
 */
import type {
  APIConnector,
  AutocompleteResponseState,
  Filter,
  RequestState,
  ResponseState,
} from "@elastic/search-ui";
import {
  buildSearchQuery,
  buildSuggestQuery,
  type BuiltQuery,
  type QueryContext,
} from "./searchQuery.js";
import {
  adaptSearchData,
  adaptSuggestions,
  type Facets,
  type ResultItem,
  type SearchPage,
  type Suggestion,
} from "./searchResponse.js";
import {
  FACETS,
  emptyState,
  normalizeValues,
  stateToQuery,
  type FacetName,
  type SearchState,
} from "./searchState.js";
import { pageNumber, searchWords } from "./search.js";

/** Fewest characters of words that ask for suggestions. */
export const SUGGEST_MINIMUM = 2;

/** Search UI's request for a state: the words, the page and one "any" filter per facet. */
export const requestFromState = (state: SearchState, size: number): RequestState => ({
  searchTerm: state.q,
  current: state.page,
  resultsPerPage: size,
  filters: FACETS.filter((facet) => state[facet].length > 0).map((facet): Filter => ({
    field: facet,
    type: "any",
    values: state[facet],
  })),
});

/** The state a Search UI request names; unknown fields and invalid values are dropped. */
export const stateFromRequest = (request: RequestState): SearchState => {
  const state = emptyState();
  state.q = searchWords(request.searchTerm);
  state.page = pageNumber(String(request.current ?? 1));
  for (const filter of request.filters ?? []) {
    const facet = FACETS.find((name) => name === filter.field);
    if (!facet) continue;
    state[facet] = normalizeValues(facet, [...state[facet], ...filter.values]);
  }
  return state;
};

/** Identifies a request (state and page size): a primed answer is only used for its own. */
export const searchKey = (state: SearchState, size: number): string =>
  `${size}|${stateToQuery(state)}`;

/** One result as Search UI holds it: every field wrapped as `{ raw }`, plus its `_meta.id`. */
const resultToUi = (item: ResultItem) => ({
  id: { raw: item.id },
  title: { raw: item.title },
  url: { raw: item.url },
  excerpt: { raw: item.excerpt },
  summary: { raw: item.summary },
  type: { raw: item.type },
  date: { raw: item.date },
  _meta: { id: item.id },
});

/** The facets as Search UI holds them: `{ tag: [{ field, type: "value", data }] }`. */
const facetsToUi = (facets: Facets): Record<string, unknown> =>
  Object.fromEntries(
    FACETS.map((name) => [name, [{ field: name, type: "value", data: facets[name] }]]),
  );

/** A Search UI response for a page (searchTerm and paging are completed by the driver). */
export const responseFromPage = (page: SearchPage, state: SearchState): ResponseState => ({
  requestId: "",
  facets: facetsToUi(page.facets),
  resultSearchTerm: state.q,
  totalPages: page.totalPages,
  totalResults: page.total,
  pagingStart: 0,
  pagingEnd: 0,
  wasSearched: true,
  results: page.items.map((item) => resultToUi(item)),
  rawResponse: {},
});

/** The wrapped value of a Search UI result field. */
const raw = (field: unknown): unknown =>
  typeof field === "object" && field !== null ? (field as { raw?: unknown }).raw : undefined;

const text = (field: unknown): string => {
  const value = raw(field);
  return typeof value === "string" ? value : "";
};

/** What the page shows, read back from a Search UI state (the driver's state after a search). */
export const pageFromResponse = (response: {
  results: unknown[];
  totalResults: number;
  totalPages: number;
  facets: Record<string, unknown>;
}): SearchPage => {
  const facets = Object.fromEntries(
    FACETS.map((name: FacetName) => {
      const group = response.facets[name];
      const data = Array.isArray(group) ? (group[0] as { data?: unknown } | undefined)?.data : [];
      return [name, Array.isArray(data) ? data : []];
    }),
  ) as unknown as Facets;
  return {
    items: response.results.map((result) => {
      const fields = result as Record<string, unknown>;
      return {
        id: text(fields.id),
        title: text(fields.title),
        url: text(fields.url) || undefined,
        excerpt: text(fields.excerpt),
        summary: text(fields.summary),
        type: text(fields.type),
        date: text(fields.date) || undefined,
      };
    }),
    total: response.totalResults,
    totalPages: response.totalPages,
    facets,
  };
};

/** Suggestions as Search UI's autocomplete state holds them. */
const suggestionsToUi = (suggestions: Suggestion[]): AutocompleteResponseState => ({
  autocompletedResults: suggestions.flatMap((suggestion) =>
    suggestion.kind === "result"
      ? [
          {
            id: { raw: suggestion.id },
            title: { raw: suggestion.title },
            url: { raw: suggestion.url },
            _meta: { id: suggestion.id },
          },
        ]
      : [],
  ),
  autocompletedResultsRequestId: "",
  autocompletedSuggestions: {
    tag: suggestions.flatMap((suggestion) =>
      suggestion.kind === "tag" ? [{ suggestion: suggestion.value }] : [],
    ),
  },
  autocompletedSuggestionsRequestId: "",
});

/** The suggestions held by an autocomplete state: titles first, then tags. */
export const suggestionsFromResponse = (response: AutocompleteResponseState): Suggestion[] => [
  ...response.autocompletedResults.map((result): Suggestion => ({
    kind: "result",
    id: text((result as Record<string, unknown>).id),
    title: text((result as Record<string, unknown>).title),
    url: text((result as Record<string, unknown>).url) || undefined,
  })),
  ...(response.autocompletedSuggestions.tag ?? []).flatMap((entry): Suggestion[] => {
    const value = (entry as { suggestion?: string }).suggestion;
    return value ? [{ kind: "tag", value }] : [];
  }),
];

/** What the connector needs to know about the page it serves. */
export interface ConnectorOptions {
  /** The site's GraphQL endpoint, `<context path>/modules/graphql`. */
  endpoint: string;
  /** The page's language, workspace, sites and default page size. */
  context: QueryContext;
  /** The page the server already read for the page's own state (consumed by the first search). */
  primed?: { key: string; page: SearchPage };
  /** For tests: replaces `fetch`. */
  fetchImpl?: typeof fetch;
}

/** The connector of a page. */
export const createSearchConnector = (options: ConnectorOptions): APIConnector => {
  const { endpoint, context } = options;
  let primed = options.primed;

  /** Posts a built query as the visitor and returns the `data` of the answer. */
  const post = async (built: BuiltQuery): Promise<unknown> => {
    const send = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    const response = await send(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(built),
    });
    if (!response.ok) throw new Error(`Search answered ${response.status}`);
    const body = (await response.json()) as { data?: { search?: unknown; main?: unknown } | null };
    if (!body.data || (body.data.search === undefined && body.data.main === undefined)) {
      throw new Error("Search is not available");
    }
    return body.data;
  };

  return {
    async onSearch(request: RequestState): Promise<ResponseState> {
      const state = stateFromRequest(request);
      const size = request.resultsPerPage ?? context.size;
      const scope = { ...context, size };
      const head = primed;
      primed = undefined;
      if (head && head.key === searchKey(state, size)) return responseFromPage(head.page, state);
      const data = await post(buildSearchQuery(state, scope));
      return responseFromPage(adaptSearchData(data, state, scope), state);
    },

    async onAutocomplete(request: RequestState): Promise<AutocompleteResponseState> {
      const words = searchWords(request.searchTerm);
      if (words.length < SUGGEST_MINIMUM) return suggestionsToUi([]);
      const data = await post(buildSuggestQuery(words, context));
      return suggestionsToUi(adaptSuggestions(data, words));
    },

    onResultClick() {},
    onAutocompleteResultClick() {},
  };
};
