/**
 * The state of a search page, in one definition used by the server view, the query builder, the
 * connector and the island: the words, the page and the selected value of each facet. Pure and
 * free of any browser or Jahia API (no `URLSearchParams`, which the server's GraalJS lacks), so the
 * same code reads the request on the server and the address in the browser, and is unit tested.
 *
 * Every value that comes from an address is validated here and nowhere else: an unknown value is
 * dropped, a list is capped, so nothing a visitor types in the URL reaches a query unchecked.
 */
import { pageNumber, searchWords } from "./search.js";

/** The facets of the page, in the order the page shows them. */
export const FACETS = ["topic", "tag", "format", "type", "site"] as const;
export type FacetName = (typeof FACETS)[number];

/** What a visitor can filter the content type by (`type` parameter). */
export const TYPES = ["story", "session", "person", "page"] as const;
export type SearchType = (typeof TYPES)[number];

/** Formats of a story (the `format` property of ctmd:story). */
export const STORY_FORMATS = [
  "news",
  "feature",
  "opinion",
  "interview",
  "report",
  "video",
  "podcast",
] as const;

/** Types of a session (the `sessionType` property of ctmd:session). */
export const SESSION_TYPES = ["keynote", "talk", "panel", "workshop", "fireside", "break"] as const;

/** Every value of the Format facet: a story's format, a session's type. They never overlap. */
export const FORMATS: readonly string[] = [...STORY_FORMATS, ...SESSION_TYPES];

/** Caps on what an address may carry. */
export const LIMITS = {
  words: 200,
  page: 999,
  tags: 10,
  tagLength: 60,
  topics: 10,
  topicLength: 120,
  topicDepth: 6,
  sites: 20,
  siteLength: 64,
} as const;

/** The state of a search: the words, the 1-based page and the selected values of each facet. */
export interface SearchState {
  q: string;
  page: number;
  topic: string[];
  tag: string[];
  format: string[];
  type: string[];
  site: string[];
}

/** The query-string parameters this definition owns (others, such as `lang`, are left alone). */
export const OWN_PARAMETERS: readonly string[] = ["q", "page", ...FACETS];

/** The state of a search nobody asked for yet. */
export const emptyState = (): SearchState => ({
  q: "",
  page: 1,
  topic: [],
  tag: [],
  format: [],
  type: [],
  site: [],
});

/** A free-text value as written in an address: whitespace collapsed, no control character. */
const clean = (value: string): string =>
  value
    .replaceAll(/\p{Cc}/gu, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

/** A tag as Jahia stores it (lower case, single spaces), or undefined when empty or too long. */
export const normalizeTag = (value: string): string | undefined => {
  const tag = clean(value).toLowerCase();
  return tag && tag.length <= LIMITS.tagLength ? tag : undefined;
};

/** One segment of a category path: letters, digits, `_`, `-` and `.` (a Jahia node name). */
const SEGMENT = /^[\p{L}\p{N}_.-]+$/u;

/**
 * A topic as a category path under the category root, `streaming/fast-channels`: segments of node
 * names, never empty, never `.` or `..`. Undefined when it is not one.
 */
export const normalizeTopic = (value: string): string | undefined => {
  const path = value.trim().replaceAll(/^\/+|\/+$/g, "");
  if (!path || path.length > LIMITS.topicLength) return undefined;
  const segments = path.split("/");
  if (segments.length > LIMITS.topicDepth) return undefined;
  return segments.every((segment) => SEGMENT.test(segment) && !/^\.+$/.test(segment))
    ? segments.join("/")
    : undefined;
};

/** A site key: what Jahia allows in one (letters, digits, `-`, `_`). */
export const normalizeSite = (value: string): string | undefined => {
  const key = value.trim();
  return key.length <= LIMITS.siteLength && /^[\w-]+$/.test(key) ? key : undefined;
};

/** `value` when it is one of `allowed`, else undefined. */
const oneOf = (allowed: readonly string[]) => (value: string) =>
  allowed.includes(value.trim()) ? value.trim() : undefined;

/** The validator of each facet's values. */
const NORMALIZERS: Record<FacetName, (value: string) => string | undefined> = {
  topic: normalizeTopic,
  tag: normalizeTag,
  format: oneOf(FORMATS),
  type: oneOf(TYPES),
  site: normalizeSite,
};

/** How many values each facet keeps. */
const MAXIMUM: Record<FacetName, number> = {
  topic: LIMITS.topics,
  tag: LIMITS.tags,
  format: FORMATS.length,
  type: TYPES.length,
  site: LIMITS.sites,
};

/** The valid values of a facet in `values`, without repeats, in order, capped. */
export const normalizeValues = (facet: FacetName, values: readonly unknown[] | undefined) => {
  const kept: string[] = [];
  for (const value of values ?? []) {
    if (typeof value !== "string") continue;
    const normal = NORMALIZERS[facet](value);
    if (normal !== undefined && !kept.includes(normal)) kept.push(normal);
    if (kept.length >= MAXIMUM[facet]) break;
  }
  return kept;
};

/** Reads a request parameter's values: `read("tag")` gives every `tag=` of the address. */
export type ParameterReader = (name: string) => readonly string[] | null | undefined;

/**
 * The state an address (or a Search UI request) names: the first `q` trimmed and capped, the first
 * `page` (1 when missing or invalid), each facet's valid values.
 */
export const parseSearchState = (read: ParameterReader): SearchState => ({
  q: searchWords(read("q")?.[0]),
  page: pageNumber(read("page")?.[0]),
  topic: normalizeValues("topic", read("topic") ?? []),
  tag: normalizeValues("tag", read("tag") ?? []),
  format: normalizeValues("format", read("format") ?? []),
  type: normalizeValues("type", read("type") ?? []),
  site: normalizeValues("site", read("site") ?? []),
});

/** `%2F` back to `/`: a slash is legal in a query string and keeps topic paths readable. */
const encode = (value: string): string => encodeURIComponent(value).replaceAll("%2F", "/");

/** Decodes one component of a query string (`+` is a space); undefined when malformed. */
const decode = (value: string): string | undefined => {
  try {
    return decodeURIComponent(value.replaceAll("+", " "));
  } catch {
    return undefined;
  }
};

/** The `name=value` pairs of a query string (with or without its `?`), malformed pairs skipped. */
export const queryPairs = (search: string): [string, string][] => {
  const pairs: [string, string][] = [];
  for (const piece of search.replace(/^\?/, "").split("&")) {
    if (!piece) continue;
    const at = piece.indexOf("=");
    const name = decode(at < 0 ? piece : piece.slice(0, at));
    const value = decode(at < 0 ? "" : piece.slice(at + 1));
    if (name !== undefined && value !== undefined) pairs.push([name, value]);
  }
  return pairs;
};

/** The state a query string names (`?q=fast&tag=carbon&tag=icvfx`). */
export const queryToState = (search: string): SearchState => {
  const pairs = queryPairs(search);
  return parseSearchState((name) =>
    pairs.filter(([key]) => key === name).map(([, value]) => value),
  );
};

/**
 * The query string (without `?`) of a state, defaults left out: `q`, then each facet's values in
 * order, then `page` when it is not the first. `queryToState(stateToQuery(state))` is the state.
 */
export const stateToQuery = (state: SearchState): string => {
  const parts: string[] = [];
  if (state.q) parts.push(`q=${encode(state.q)}`);
  for (const facet of FACETS) {
    for (const value of state[facet]) parts.push(`${facet}=${encode(value)}`);
  }
  if (state.page > 1) parts.push(`page=${state.page}`);
  return parts.join("&");
};

/** `path` with the query of `state` (`path` may already carry a query). */
export const stateUrl = (path: string, state: SearchState): string => {
  const query = stateToQuery(state);
  if (!query) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${query}`;
};

/**
 * The query string to write when the state changes: the parameters of `current` this definition
 * does not own (`lang`, a tracking parameter) kept, then the state's own.
 */
export const mergeQuery = (current: string, own: string): string => {
  const kept = current
    .replace(/^\?/, "")
    .split("&")
    .filter((piece) => {
      if (!piece) return false;
      const name = decode(piece.split("=")[0] ?? "");
      return name !== undefined && !OWN_PARAMETERS.includes(name);
    });
  return [...kept, ...(own ? [own] : [])].join("&");
};

/** True when the state asks for something: words or at least one selected facet value. */
export const isAsked = (state: SearchState): boolean =>
  state.q !== "" || FACETS.some((facet) => state[facet].length > 0);

/** How many facet values are selected, all facets together. */
export const selectedCount = (state: SearchState): number =>
  FACETS.reduce((total, facet) => total + state[facet].length, 0);

/** The state with `facet`'s values replaced and the page back to the first. */
export const withFacet = (
  state: SearchState,
  facet: FacetName,
  values: readonly string[],
): SearchState => ({ ...state, [facet]: normalizeValues(facet, values), page: 1 });

/** The state without any facet value (the words stay), on the first page. */
export const withoutFilters = (state: SearchState): SearchState => ({
  ...state,
  page: 1,
  topic: [],
  tag: [],
  format: [],
  type: [],
  site: [],
});

/** The state of the first page of an `item` page link: just one tag. */
export const tagState = (tag: string): SearchState => ({
  ...emptyState(),
  tag: normalizeValues("tag", [tag]),
});
