/**
 * Pure helpers of the header's search box: the autocomplete query to Augmented Search, the
 * suggestions read from its answer, and the address of the search page for some words. Unit
 * tested in headerSearch.test.ts.
 *
 * The template set does not require Augmented Search or classic-media: nothing here assumes the
 * `search` field exists. A failed call or an answer of another shape gives no suggestion, and the
 * box still submits to the search page. (The search section itself is classic-media's; the two
 * bundles share no code, so the little this needs is written here.)
 */
import { safeLocalPath } from "./account.js";

/** Fewest characters of words that ask for suggestions. */
export const SUGGEST_MINIMUM = 2;

/** Most titles suggested. */
export const SUGGEST_MAXIMUM = 5;

/** Longest words sent to the search. */
export const WORDS_MAXIMUM = 200;

/**
 * The autocomplete query: the five best matches of the words, as the visitor, in the live
 * workspace. The words, the sites and the language are variables, never part of the document.
 */
export const SUGGEST_QUERY = `query HeaderSuggest($q: String!, $sites: [String], $language: String, $workspace: Workspace) {
  search(q: $q, siteKeys: $sites, language: $language, workspace: $workspace) {
    results(page: 0, size: ${SUGGEST_MAXIMUM}) { hits { id displayableName link } }
  }
}`;

/** The words as typed: trimmed, capped. */
export const wordsOf = (value: string): string => value.trim().slice(0, WORDS_MAXIMUM);

/** The variables of the autocomplete query. */
export const suggestVariables = (words: string, sites: readonly string[], language: string) => ({
  q: wordsOf(words),
  sites: [...sites],
  language,
  workspace: "LIVE",
});

/** One suggested item: its title and where it is. */
export interface Suggestion {
  id: string;
  title: string;
  url: string;
}

/** A hit's address when it is a site path or an http(s) address, else undefined. */
export const hitUrl = (link: unknown): string | undefined => {
  if (typeof link !== "string") return undefined;
  const url = link.trim();
  if (safeLocalPath(url)) return url;
  return /^https?:\/\/\S+$/i.test(url) ? url : undefined;
};

/**
 * The suggestions an answer holds (`data.search.results.hits`): five at most, none twice, each with
 * a title and an address that is safe to follow. Anything else in the answer is ignored.
 */
export const suggestionsOf = (answer: unknown): Suggestion[] => {
  const hits = (answer as { data?: { search?: { results?: { hits?: unknown } } } } | null)?.data
    ?.search?.results?.hits;
  if (!Array.isArray(hits)) return [];
  const seen = new Set<string>();
  const suggestions: Suggestion[] = [];
  for (const hit of hits as Record<string, unknown>[]) {
    const url = hitUrl(hit?.link);
    const title = typeof hit?.displayableName === "string" ? hit.displayableName.trim() : "";
    const id = typeof hit?.id === "string" ? hit.id : "";
    if (!url || !title || !id || seen.has(id)) continue;
    seen.add(id);
    suggestions.push({ id, title, url });
    if (suggestions.length >= SUGGEST_MAXIMUM) break;
  }
  return suggestions;
};

/** The search page's address for `words` (`action` is a site path that may already carry a query). */
export const searchUrl = (action: string, words: string): string => {
  const query = wordsOf(words);
  if (!query) return action;
  return `${action}${action.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}`;
};

/** What the keyboard asks of a combobox with a list of suggestions. */
export interface KeyInput {
  key: string;
  /** The list box is open. */
  open: boolean;
  /** The highlighted option, -1 for none. */
  active: number;
  /** How many options there are. */
  count: number;
  /** The key was pressed in the input (not on another control of the box). */
  fromInput: boolean;
  /** A panel holding the box is open (small screens). */
  expanded?: boolean;
}

/** The effect of a key: what to change, whether to cancel the browser's own handling, what to do. */
export interface KeyResult {
  /** Cancel the key's default (arrow keys scroll, Enter submits the form). */
  prevent: boolean;
  open?: boolean;
  active?: number;
  /** Go to the option at this index (the highlighted one, on Enter). */
  pick?: number;
  /** Close the panel and give the focus back to its button. */
  collapse?: boolean;
}

const NOTHING: KeyResult = { prevent: false };

const escapeResult = ({ open, expanded }: KeyInput): KeyResult => {
  if (open) return { prevent: true, open: false, active: -1 };
  return expanded ? { prevent: true, collapse: true } : NOTHING;
};

const arrowResult = ({ key, open, active, count }: KeyInput): KeyResult => {
  if (count === 0) return NOTHING;
  if (!open) return { prevent: true, open: true };
  if (key === "ArrowDown") return { prevent: true, active: (active + 1) % count };
  return { prevent: true, active: active <= 0 ? count - 1 : active - 1 };
};

const enterResult = ({ open, active, count }: KeyInput): KeyResult => {
  if (open && active >= 0 && active < count) {
    return { prevent: true, open: false, active: -1, pick: active };
  }
  return { prevent: false, open: false, active: -1 };
};

/**
 * The keyboard model of the combobox (ARIA 1.2 pattern): ArrowDown and ArrowUp open the list, then
 * move the highlight (wrapping); Enter on a highlighted option goes to it, Enter with none lets the
 * form submit (the words go to the search page); Escape closes the list, then the panel.
 */
export const keyResult = (input: KeyInput): KeyResult => {
  if (input.key === "Escape") return escapeResult(input);
  if (!input.fromInput) return NOTHING;
  if (input.key === "ArrowDown" || input.key === "ArrowUp") return arrowResult(input);
  return input.key === "Enter" ? enterResult(input) : NOTHING;
};
