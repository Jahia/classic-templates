/**
 * The store between the island and Search UI's driver: what React reads with
 * `useSyncExternalStore`. Plain TypeScript (no React), so its behaviour is unit tested with a fake
 * driver.
 *
 * Before the driver has loaded (it is a separate chunk, fetched in the browser), the snapshot is
 * the page the server rendered, so the island shows exactly what was there; the actions a visitor
 * takes in that moment are kept and run as soon as the driver is ready.
 */
import type { APIConnector, SearchDriver, SearchState as DriverState } from "@elastic/search-ui";
import { pageFromResponse, stateFromRequest, suggestionsFromResponse } from "./searchConnector.js";
import type { SearchPage, Suggestion } from "./searchResponse.js";
import type { DriverConfig } from "./searchDriver.js";
import type { FacetName, SearchState } from "./searchState.js";

/** What the island renders. */
export interface SearchView {
  state: SearchState;
  page: SearchPage;
  /** A search is under way. */
  loading: boolean;
  /** The last search failed (Augmented Search is down or missing). */
  failed: boolean;
}

/** What a visitor can do. */
export interface SearchActions {
  /** Search for these words (the filters stay). */
  setQuery(words: string): void;
  /** Select or unselect one value of a facet. */
  toggle(facet: FacetName, value: string, selected: boolean): void;
  /** Unselect every facet value (the words stay). */
  clearFilters(): void;
  /** Go to a page of the results. */
  setPage(page: number): void;
  /** Suggestions for the words typed (never rejects: no suggestion when it fails). */
  suggest(words: string): Promise<Suggestion[]>;
}

export interface SearchStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): SearchView;
  /** Loads the driver and starts listening to it. */
  start(): void;
  /** Stops listening and releases the driver (the address handlers). */
  stop(): void;
  actions: SearchActions;
}

/** Loads the driver factory: a dynamic import in the island, a fake in tests. */
export type DriverLoader = () => Promise<(config: DriverConfig) => SearchDriver>;

/** The view of a driver's state; the page the driver has not searched yet is `fallback`. */
export const viewOf = (driver: DriverState, fallback: SearchPage): SearchView => ({
  state: stateFromRequest(driver),
  page: driver.wasSearched ? pageFromResponse(driver) : fallback,
  loading: driver.isLoading,
  failed: driver.error !== "",
});

export const createSearchStore = (options: {
  initial: SearchView;
  connector: APIConnector;
  size: number;
  loadDriver: DriverLoader;
}): SearchStore => {
  const { initial, connector, size, loadDriver } = options;
  let snapshot = initial;
  let driver: SearchDriver | undefined;
  let generation = 0;
  const listeners = new Set<() => void>();
  const pending: ((driver: SearchDriver) => void)[] = [];

  const publish = (next: SearchView) => {
    snapshot = next;
    for (const listener of listeners) listener();
  };
  const onDriverState = (state: DriverState) => publish(viewOf(state, initial.page));

  /** Runs `act` on the driver, now or once it has loaded. */
  const run = (act: (driver: SearchDriver) => void) => {
    if (driver) act(driver);
    else pending.push(act);
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,

    start() {
      if (driver) return;
      const mine = ++generation;
      loadDriver().then(
        (create) => {
          if (mine !== generation) return;
          const created = create({ connector, size });
          driver = created;
          created.subscribeToStateChanges(onDriverState);
          for (const act of pending.splice(0)) act(created);
          onDriverState(created.getState());
        },
        () => {
          // the chunk did not load (offline): the server's page stays, links and form still work
        },
      );
    },

    stop() {
      generation++;
      if (driver) {
        driver.unsubscribeToStateChanges(onDriverState);
        driver.tearDown();
        driver = undefined;
      }
    },

    actions: {
      setQuery: (words) =>
        run((d) => d.actions.setSearchTerm(words, { shouldClearFilters: false })),
      toggle: (facet, value, selected) =>
        run((d) =>
          selected
            ? d.actions.addFilter(facet, value, "any")
            : d.actions.removeFilter(facet, value, "any"),
        ),
      clearFilters: () => run((d) => d.actions.clearFilters()),
      setPage: (page) => run((d) => d.actions.setCurrent(page)),
      async suggest(words) {
        try {
          return suggestionsFromResponse(await connector.onAutocomplete({ searchTerm: words }, {}));
        } catch {
          return [];
        }
      },
    },
  };
};
