/**
 * The one query builder of the search page: a search state and the page's scope in, a GraphQL
 * document and its variables out, for Augmented Search. The server view runs it with `useGQLQuery`,
 * the browser connector (searchConnector.ts) posts it to /modules/graphql: one definition, so both
 * show the same results. Pure and unit tested.
 *
 * Every value that comes from a visitor (the words, a tag, a topic, a site) travels in a variable,
 * never in the document, which is made of constants only.
 *
 * How filters are expressed (probed on Augmented Search 3, Jahia 8.2): `filters.custom.term` is a
 * list of term groups; the groups are ANDed, the terms of a group are combined with the group's
 * `operation`. One group per facet with operation OR therefore gives "a value of this facet OR
 * another, AND a value of that facet". Every facet, the content type and the site included, is such
 * a group (on `jgql:nodeType` and `jgql:originSite`).
 *
 * Counts: a facet's values are counted by a search that carries every filter EXCEPT the facet's
 * own group (a disjunctive count, so a selected value does not zero its siblings). A facet with no
 * selection is counted by the main search itself; a facet with one has its own aliased search. The
 * Augmented Search `disjunctive` flag is not used: it keys on a single field, and the Format facet
 * spans two (`format` of stories, `sessionType` of sessions).
 */
import {
  FACETS,
  STORY_FORMATS,
  type FacetName,
  type SearchState,
  type SearchType,
} from "./searchState.js";

/** The Augmented Search field of each facet. */
export const FIELDS = {
  tag: "jcr:tags",
  topic: "jgql:categories_path",
  type: "jgql:nodeType",
  site: "jgql:originSite",
  /** The `format` property of ctmd:story, indexed under its bare name once it is `facetable`. */
  format: "format",
  /** The `sessionType` property of ctmd:session, likewise. */
  sessionType: "sessionType",
} as const;

/** The node type a `type` value stands for (the field holds every supertype, subtypes match). */
export const TYPE_NODE: Record<SearchType, string> = {
  story: "ctmd:story",
  session: "ctmd:session",
  person: "ctmd:person",
  page: "jnt:page",
};

/** How many values a facet asks the index for (tags are shown 12 at first, then more on demand). */
const FACET_SIZE: Record<string, number> = {
  topic: 1000,
  tag: 50,
  type: 1000,
  site: 50,
  format: 30,
  sessionType: 30,
};

/** What a search is scoped to: the language, the workspace, the sites and the page size. */
export interface QueryContext {
  language: string;
  workspace: "LIVE" | "EDIT";
  /** The sites the page may search: its own, and with network scope the ones its network bar links. */
  sites: readonly string[];
  size: number;
}

/** A GraphQL document with the values of its variables. */
export interface BuiltQuery {
  query: string;
  variables: Record<string, unknown>;
}

/** One term of Augmented Search's `custom.term` filter. */
export interface FilterTerm {
  field: string;
  value: string;
}

/** The `filters` argument of `search`: groups ANDed together, each group's terms ORed. */
export interface SearchFilters {
  custom: { term: { operation: "OR"; terms: FilterTerm[] }[] };
}

/** Characters the index's regular expressions treat as operators. */
const REGEX_SPECIAL = /[.?+*|{}[\]()"\\#@&<>~]/g;

/**
 * The term value matching a category and everything under it. The index stores a category as
 * `key###title` segments joined by `/`, root first (`orvane###orvane/streaming###Streaming/...`);
 * a topic is the key path under the root, so the root segment is matched whatever it is, and each
 * key is matched whole (`stre` never matches `streaming`).
 */
export const topicFilter = (topic: string): string => {
  const keys = topic.split("/").map((key) => key.replaceAll(REGEX_SPECIAL, String.raw`\$&`));
  const segments = keys.map((key) => `/${key}[#]{3}[^/]*`);
  return `reg:[^/]*[#]{3}[^/]*${segments.join("")}(/.*)?`;
};

/** The terms a facet's selected values stand for. */
const termsOf = (facet: FacetName, values: readonly string[]): FilterTerm[] => {
  switch (facet) {
    case "tag": {
      return values.map((value) => ({ field: FIELDS.tag, value }));
    }
    case "topic": {
      return values.map((value) => ({ field: FIELDS.topic, value: topicFilter(value) }));
    }
    case "type": {
      return values.map((value) => ({ field: FIELDS.type, value: TYPE_NODE[value as SearchType] }));
    }
    case "site": {
      return values.map((value) => ({ field: FIELDS.site, value }));
    }
    case "format": {
      return values.map((value) => ({
        field: (STORY_FORMATS as readonly string[]).includes(value)
          ? FIELDS.format
          : FIELDS.sessionType,
        value,
      }));
    }
  }
};

/** The selected values of a facet that the scope allows (a site outside it is not searched). */
const selectionOf = (state: SearchState, facet: FacetName, ctx: QueryContext): string[] =>
  facet === "site" ? state.site.filter((key) => ctx.sites.includes(key)) : state[facet];

/**
 * The filters of a state, without the group of `omit` (what counts that facet's values). Undefined
 * when nothing filters.
 */
export const filtersFor = (
  state: SearchState,
  ctx: QueryContext,
  omit?: FacetName,
): SearchFilters | undefined => {
  const term: SearchFilters["custom"]["term"] = [];
  for (const facet of FACETS) {
    if (facet === omit) continue;
    const values = selectionOf(state, facet, ctx);
    if (values.length > 0) term.push({ operation: "OR", terms: termsOf(facet, values) });
  }
  return term.length > 0 ? { custom: { term } } : undefined;
};

/** The facets with at least one selected value. */
export const activeFacets = (state: SearchState, ctx: QueryContext): FacetName[] =>
  FACETS.filter((facet) => selectionOf(state, facet, ctx).length > 0);

/** The GraphQL selection that counts a facet's values. */
const AGGREGATES: Record<FacetName, string> = {
  topic: facetSelection("topic", FIELDS.topic),
  tag: facetSelection("tag", FIELDS.tag),
  type: facetSelection("type", FIELDS.type),
  site: facetSelection("site", FIELDS.site),
  format:
    facetSelection("format", FIELDS.format) +
    " " +
    facetSelection("sessionType", FIELDS.sessionType),
};

function facetSelection(alias: string, field: string): string {
  return `${alias}: termFacet(field: "${field}", max: ${FACET_SIZE[alias]}) { data { value count } }`;
}

const HITS =
  'results(page: $page, size: $size, sortBy: $sort) { totalHits hasMore hits { id displayableName excerpt link nodeType lastPublished lastModified created description: property(name: "jgql:description") teaser: property(name: "teaser") role: property(name: "role") } }';

/** Newest first: what a search by filters alone (no words) is ordered by. */
const NEWEST = [{ field: "jgql:lastPublished", dir: "DESC" }];

/** One aliased `search` with the page's scope and, when given, the variable holding its filters. */
const searchBlock = (alias: string, filters: string | undefined, body: string): string => {
  const args = "q: $q, siteKeys: $sites, language: $language, workspace: $workspace";
  const withFilters = filters ? `${args}, filters: $${filters}` : args;
  return `${alias}: search(${withFilters}) { ${body} }`;
};

/** True when the state asks for something (words or a facet value): then results are listed. */
const asks = (state: SearchState, ctx: QueryContext): boolean =>
  state.q !== "" || activeFacets(state, ctx).length > 0;

/**
 * The query of a state: the results of the page (when something is asked; otherwise only the
 * facets, so the page can offer them) and every facet's counts. The answer is
 * `{ main: { results, <facets without a selection> }, by_<facet>: { <the facet> } }`
 * (see searchResponse.ts).
 */
export const buildSearchQuery = (state: SearchState, ctx: QueryContext): BuiltQuery => {
  const active = activeFacets(state, ctx);
  const asked = asks(state, ctx);
  const variables: Record<string, unknown> = {
    q: state.q,
    sites: [...ctx.sites],
    language: ctx.language,
    workspace: ctx.workspace,
  };
  const declarations = [
    "$q: String!",
    "$sites: [String]",
    "$language: String",
    "$workspace: Workspace",
  ];
  const blocks: string[] = [];

  const main = filtersFor(state, ctx);
  if (main) {
    variables.f = main;
    declarations.push("$f: Inputfilter");
  }
  const mainBody: string[] = [];
  if (asked) {
    variables.page = state.page - 1;
    variables.size = ctx.size;
    declarations.push("$page: Int", "$size: Int");
    if (state.q === "") {
      variables.sort = NEWEST;
      declarations.push("$sort: [InputsortV2]");
    }
    mainBody.push(state.q === "" ? HITS : HITS.replaceAll(", sortBy: $sort", ""));
  }
  for (const facet of FACETS) {
    if (!active.includes(facet)) mainBody.push(AGGREGATES[facet]);
  }
  blocks.push(searchBlock("main", main ? "f" : undefined, mainBody.join(" ")));

  for (const facet of active) {
    const name = `f_${facet}`;
    const filters = filtersFor(state, ctx, facet);
    if (filters) {
      variables[name] = filters;
      declarations.push(`$${name}: Inputfilter`);
    }
    blocks.push(searchBlock(`by_${facet}`, filters ? name : undefined, AGGREGATES[facet]));
  }

  return { query: `query Search(${declarations.join(", ")}) { ${blocks.join(" ")} }`, variables };
};

/** Suggestions asked for: the titles of the best matches, and the tags of the matching content. */
const SUGGEST = `query Suggest($q: String!, $sites: [String], $language: String, $workspace: Workspace) {
  search(q: $q, siteKeys: $sites, language: $language, workspace: $workspace) {
    results(page: 0, size: 5) { hits { id displayableName link nodeType } }
    tags: termFacet(field: "${FIELDS.tag}", max: 30) { data { value count } }
  }
}`;

/** The query of the autocomplete: the first five matches of `words` and the tags around them. */
export const buildSuggestQuery = (words: string, ctx: QueryContext): BuiltQuery => ({
  query: SUGGEST,
  variables: {
    q: words,
    sites: [...ctx.sites],
    language: ctx.language,
    workspace: ctx.workspace,
  },
});
