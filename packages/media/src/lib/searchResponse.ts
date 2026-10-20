/**
 * Reads the answer of a search query (searchQuery.ts) into the model the page shows: the result
 * items, the totals and each facet's values with their counts. Pure and defensive (an answer that
 * lacks a field gives an empty list, never a throw), unit tested on fixtures of the real answers.
 *
 * Used by the server view (the first page, no JavaScript) and by the browser connector, so both
 * render the same model.
 */
import { activeFacets, TYPE_NODE, type QueryContext } from "./searchQuery.js";
import { FORMATS, TYPES, normalizeTopic, type FacetName, type SearchState } from "./searchState.js";
import { isSafeExternalUrl, safeLocalPath } from "./urls.js";

/** One value of a facet. A topic also carries its title and the path of its parent topic. */
export interface FacetEntry {
  value: string;
  count: number;
  label?: string;
  parent?: string;
}

export type Facets = Record<FacetName, FacetEntry[]>;

/** One search result. */
export interface ResultItem {
  id: string;
  title: string;
  /** Where the title links; undefined when the index gave an address that is not safe to follow. */
  url?: string;
  /** The excerpt as the index gives it, `<em>` around the matched words: see excerptParts. */
  excerpt: string;
  /**
   * Plain text shown when there is no excerpt (a search by filters only has no words to highlight):
   * the item's SEO description (jcr:description, as `jgql:description`), else its teaser, else a
   * person's role. The same order as the page's own meta description in the template set.
   */
  summary: string;
  /** The node type of the hit, which gives its kind label. */
  type: string;
  date?: string;
}

/** What a search page shows. */
export interface SearchPage {
  items: ResultItem[];
  total: number;
  totalPages: number;
  facets: Facets;
}

/** A suggestion of the autocomplete: a result to open, or a tag to filter by. */
export type Suggestion =
  { kind: "result"; id: string; title: string; url?: string } | { kind: "tag"; value: string };

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asObject = (value: unknown): Json => (isObject(value) ? value : {});

const asText = (value: unknown): string => (typeof value === "string" ? value : "");

const asNumber = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

/** The `{ value, count }` buckets of a term facet answer. */
const bucketsOf = (facet: unknown): { value: string; count: number }[] => {
  const data = asObject(facet).data;
  if (!Array.isArray(data)) return [];
  return data.flatMap((bucket: unknown) => {
    const { value, count } = asObject(bucket);
    return typeof value === "string" ? [{ value, count: asNumber(count) }] : [];
  });
};

/** The address of a hit when it is a site path or a web address, never `javascript:` and the like. */
export const safeHref = (link: unknown): string | undefined => {
  const url = asText(link).trim();
  if (safeLocalPath(url)) return url;
  return /^https?:\/\//i.test(url) && isSafeExternalUrl(url) ? url : undefined;
};

/** The result items of an answer's `results`. */
const itemsOf = (results: Json): ResultItem[] => {
  const hits = results.hits;
  if (!Array.isArray(hits)) return [];
  return hits.flatMap((raw: unknown) => {
    const hit = asObject(raw);
    const id = asText(hit.id);
    if (!id) return [];
    const date = asText(hit.lastPublished) || asText(hit.lastModified) || asText(hit.created);
    return [
      {
        id,
        title: asText(hit.displayableName),
        url: safeHref(hit.link),
        excerpt: asText(hit.excerpt),
        summary: asText(hit.description) || asText(hit.teaser) || asText(hit.role),
        type: asText(hit.nodeType),
        date: date || undefined,
      },
    ];
  });
};

/** A selected value that no bucket carries still shows (count 0), so it can be unselected. */
const withSelected = (
  entries: FacetEntry[],
  selected: readonly string[],
  extra?: (value: string) => Partial<FacetEntry>,
): FacetEntry[] => {
  const missing = selected
    .filter((value) => !entries.some((entry) => entry.value === value))
    .map((value) => ({ value, count: 0, ...extra?.(value) }));
  return [...entries, ...missing];
};

/** Counts first, then the order of the alphabet of the label. */
const byCount = (a: FacetEntry, b: FacetEntry): number =>
  b.count - a.count || (a.label ?? a.value).localeCompare(b.label ?? b.value);

/** One segment of an indexed category path: its key and its title. */
interface Segment {
  key: string;
  label: string;
}

/**
 * The segments of an indexed category path. The index stores `key###title` per level, joined by
 * `/`: `orvane###orvane/streaming###Streaming and distribution`. A title may hold a `/`, so the
 * path is cut only where the next segment starts (`key###`).
 */
export const categorySegments = (path: string): Segment[] =>
  path.split(/\/(?=[^/#]+###)/).flatMap((piece) => {
    const at = piece.indexOf("###");
    return at > 0 ? [{ key: piece.slice(0, at), label: piece.slice(at + 3) }] : [];
  });

/**
 * The topics of a category facet as a tree in reading order (parents before their children,
 * siblings by count): the key path under the root is the value. Only the root with the most items
 * is read; the root itself is not a topic.
 */
export const topicEntries = (
  buckets: readonly { value: string; count: number }[],
  selected: readonly string[],
): FacetEntry[] => {
  const nodes = buckets.flatMap(({ value, count }) => {
    const segments = categorySegments(value);
    return segments.length > 0 ? [{ segments, count }] : [];
  });
  const roots = new Map<string, number>();
  for (const { segments, count } of nodes) {
    if (segments.length === 1 && segments[0]) roots.set(segments[0].key, count);
  }
  const root = [...roots.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const entries: FacetEntry[] = [];
  for (const { segments, count } of nodes) {
    if (segments.length < 2 || segments[0]?.key !== root) continue;
    const keys = segments.slice(1).map((segment) => segment.key);
    const value = normalizeTopic(keys.join("/"));
    if (!value) continue;
    entries.push({
      value,
      count,
      label: segments.at(-1)?.label || keys.at(-1),
      parent: keys.length > 1 ? keys.slice(0, -1).join("/") : undefined,
    });
  }
  const all = withSelected(entries, selected, (value) => {
    const keys = value.split("/");
    return {
      label: keys.at(-1),
      parent: keys.length > 1 ? keys.slice(0, -1).join("/") : undefined,
    };
  });
  // A topic whose parent is not listed (not counted, not selected) is shown at the top.
  const known = new Set(all.map((entry) => entry.value));
  const level = (parent: string | undefined): FacetEntry[] =>
    all
      .filter(
        (entry) => (entry.parent && known.has(entry.parent) ? entry.parent : undefined) === parent,
      )
      .sort(byCount);
  const ordered: FacetEntry[] = [];
  const walk = (parent: string | undefined) => {
    for (const entry of level(parent)) {
      ordered.push(entry);
      walk(entry.value);
    }
  };
  walk(undefined);
  return ordered;
};

/** The values of the Format facet: story formats and session types together, known values only. */
const formatEntries = (
  formats: readonly { value: string; count: number }[],
  sessionTypes: readonly { value: string; count: number }[],
  selected: readonly string[],
): FacetEntry[] => {
  const entries = [...formats, ...sessionTypes]
    .filter(({ value }) => FORMATS.includes(value))
    .map(({ value, count }) => ({ value, count }));
  return withSelected(entries, selected).sort(
    (a, b) => b.count - a.count || FORMATS.indexOf(a.value) - FORMATS.indexOf(b.value),
  );
};

/** The content types with something in them (or selected), in the page's order. */
const typeEntries = (
  buckets: readonly { value: string; count: number }[],
  selected: readonly string[],
): FacetEntry[] =>
  TYPES.flatMap((type) => {
    const count = buckets.find((bucket) => bucket.value === TYPE_NODE[type])?.count ?? 0;
    return count > 0 || selected.includes(type) ? [{ value: type, count }] : [];
  });

/** The sites of the scope with something in them (or selected), in the scope's order. */
const siteEntries = (
  buckets: readonly { value: string; count: number }[],
  selected: readonly string[],
  ctx: QueryContext,
): FacetEntry[] =>
  ctx.sites.flatMap((site) => {
    const count = buckets.find((bucket) => bucket.value === site)?.count ?? 0;
    return count > 0 || selected.includes(site) ? [{ value: site, count }] : [];
  });

/**
 * The page an answer describes. `data` is the `data` of the GraphQL answer to the query that
 * buildSearchQuery made for `state` and `ctx`.
 */
export const adaptSearchData = (
  data: unknown,
  state: SearchState,
  ctx: QueryContext,
): SearchPage => {
  const answer = asObject(data);
  const main = asObject(answer.main);
  const active = activeFacets(state, ctx);
  /** The block that counted a facet: its own search when it has a selection, else the main one. */
  const block = (facet: FacetName): Json =>
    active.includes(facet) ? asObject(answer[`by_${facet}`]) : main;
  const results = asObject(main.results);
  const total = asNumber(results.totalHits);
  const tag = block("tag");
  const format = block("format");
  const facets: Facets = {
    topic: topicEntries(bucketsOf(block("topic").topic), state.topic),
    tag: withSelected(
      bucketsOf(tag.tag).map(({ value, count }) => ({ value, count })),
      state.tag,
    ),
    format: formatEntries(bucketsOf(format.format), bucketsOf(format.sessionType), state.format),
    type: typeEntries(bucketsOf(block("type").type), state.type),
    site: siteEntries(bucketsOf(block("site").site), state.site, ctx),
  };
  return {
    items: itemsOf(results),
    total,
    totalPages: total > 0 ? Math.ceil(total / ctx.size) : 0,
    facets,
  };
};

/** How many tag suggestions the autocomplete adds to the titles. */
const SUGGESTED_TAGS = 3;

/**
 * The suggestions for `words`: the titles of the best matches (five at most, none twice), then the
 * tags of the matching content that contain the words (three at most).
 */
export const adaptSuggestions = (data: unknown, words: string): Suggestion[] => {
  const search = asObject(asObject(data).search);
  const needle = words.trim().toLowerCase();
  const seen = new Set<string>();
  const suggestions: Suggestion[] = [];
  for (const item of itemsOf(asObject(search.results))) {
    if (!item.title || seen.has(item.id)) continue;
    seen.add(item.id);
    suggestions.push({ kind: "result", id: item.id, title: item.title, url: item.url });
  }
  const tags = bucketsOf(search.tags)
    .map(({ value }) => value)
    .filter((value) => needle !== "" && value.toLowerCase().includes(needle))
    .slice(0, SUGGESTED_TAGS);
  for (const value of tags) suggestions.push({ kind: "tag", value });
  return suggestions.slice(0, 5 + SUGGESTED_TAGS);
};
