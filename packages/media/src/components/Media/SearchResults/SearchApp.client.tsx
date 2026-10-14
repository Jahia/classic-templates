import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { createSearchConnector, searchKey } from "../../../lib/searchConnector.js";
import type { SearchPage, Suggestion } from "../../../lib/searchResponse.js";
import { createSearchStore } from "../../../lib/searchStore.js";
import type { FacetName, SearchState } from "../../../lib/searchState.js";
import { SearchPanel } from "./panel.js";
import { SearchInput } from "./parts.js";
import { SearchCombobox } from "./SearchCombobox.js";

interface Props {
  /** The site's GraphQL endpoint. */
  endpoint: string;
  /** The address of this page: the base of every link the island writes. */
  action: string;
  language: string;
  workspace: "LIVE" | "EDIT";
  /** The sites searched (the page's, and with network scope the others). */
  sites: string[];
  siteLabels: Record<string, string>;
  size: number;
  /** Heading level of the section's title. */
  level: number;
  title?: string;
  noResultText?: string;
  /** Unique on the page. */
  idPrefix: string;
  /** The identifier of the section's node: the target of the tracking events. */
  trackId: string;
  /** What the server rendered: shown until the first search, and answered without a request. */
  initial: { state: SearchState; page: SearchPage };
}

/** Tells the page's tracking script (static/js/media.js) what the visitor searched for. */
const announce = (root: HTMLElement | null, name: string, detail: Record<string, string>) =>
  root?.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

/** False while the server's HTML is hydrated, true from the first render after it (React API). */
const subscribeNever = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

/**
 * The search section in the browser: Elastic Search UI's driver behind our own connector to Jahia's
 * Augmented Search, rendered with the same markup as the server's.
 *
 * Without JavaScript the server's GET form and links do everything. The island is server-rendered
 * from that same state (so there is one markup), hydrated, then switches to its interactive form:
 * its first render is exactly the server's HTML (React reports any difference as hydration error
 * #418), the combobox, the controlled boxes and the buttons replace the plain ones right after it.
 * It starts from the page the server already read, so nothing flashes and no request is made for it. Facets, paging and words change
 * the address (clean URLs, one history entry per change, back and forward work) and the results
 * without a reload. Focus goes to the results heading after a page change.
 */
export default function SearchApp({
  endpoint,
  action,
  language,
  workspace,
  sites,
  siteLabels,
  size,
  level,
  title,
  noResultText,
  idPrefix,
  trackId,
  initial,
}: Readonly<Props>) {
  const [store] = useState(() =>
    createSearchStore({
      initial: { state: initial.state, page: initial.page, loading: false, failed: false },
      size,
      connector: createSearchConnector({
        endpoint,
        context: { language, workspace, sites, size },
        primed: { key: searchKey(initial.state, size), page: initial.page },
      }),
      // The driver (Search UI) is a separate chunk, fetched here and never on the server.
      loadDriver: async () => (await import("../../../lib/searchDriver.js")).createDriver,
    }),
  );
  useEffect(() => {
    store.start();
    return () => store.stop();
  }, [store]);
  const view = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const live = useHydrated();

  const [text, setText] = useState(initial.state.q);
  const [seenWords, setSeenWords] = useState(initial.state.q);
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const announcedRef = useRef(initial.state.q);
  const focusAfterRef = useRef<"results" | "chips" | undefined>(undefined);
  const inputId = `${idPrefix}-q`;

  // The driver's words (the address changed, back button, a picked suggestion) fill the box.
  if (view.state.q !== seenWords) {
    setSeenWords(view.state.q);
    setText(view.state.q);
  }

  // Once a search has answered: move focus where the visitor's action points, and report the words.
  useEffect(() => {
    if (view.loading) return;
    if (focusAfterRef.current === "results") headingRef.current?.focus();
    else if (focusAfterRef.current === "chips") {
      const target = rootRef.current?.querySelector<HTMLElement>("[data-ctmd-chip]");
      (target ?? globalThis.document.getElementById(inputId))?.focus();
    }
    focusAfterRef.current = undefined;
    if (view.state.q && view.state.q !== announcedRef.current && !view.failed) {
      announcedRef.current = view.state.q;
      announce(rootRef.current, "ctmd:search", { keyword: view.state.q, id: trackId });
    }
  }, [view, inputId, trackId]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    store.actions.setQuery(text.trim());
  };

  const pick = (suggestion: Suggestion) => {
    if (suggestion.kind === "tag") {
      setText("");
      store.actions.setQuery("");
      store.actions.toggle("tag", suggestion.value, true);
    } else {
      setText(suggestion.title);
      store.actions.setQuery(suggestion.title);
    }
  };

  const toggle = (facet: FacetName, value: string, selected: boolean) => {
    focusAfterRef.current = selected ? undefined : "chips";
    store.actions.toggle(facet, value, selected);
    if (selected) announce(rootRef.current, "ctmd:filter", { facet, value, id: trackId });
  };

  return (
    <SearchPanel
      idPrefix={idPrefix}
      title={title}
      level={level}
      action={action}
      state={view.state}
      page={view.page}
      loading={view.loading}
      failed={view.failed}
      size={size}
      siteLabels={siteLabels}
      showSites={sites.length > 1}
      noResultText={noResultText}
      interactive={live}
      rootRef={rootRef}
      resultsHeadingRef={headingRef}
      onSubmit={submit}
      onToggle={toggle}
      onClear={() => {
        focusAfterRef.current = "chips";
        store.actions.clearFilters();
      }}
      onPage={(page) => {
        focusAfterRef.current = "results";
        store.actions.setPage(page);
      }}
      box={
        live ? (
          <SearchCombobox
            id={inputId}
            value={text}
            onChange={setText}
            suggest={store.actions.suggest}
            onPick={pick}
          />
        ) : (
          <SearchInput id={inputId} value={text} />
        )
      }
    />
  );
}
