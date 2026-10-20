import type { APIConnector, SearchDriver, SearchState as DriverState } from "@elastic/search-ui";
import { describe, expect, it, vi } from "vitest";
import { createSearchStore, viewOf, type SearchView } from "./searchStore.js";
import { emptyState } from "./searchState.js";
import type { SearchPage } from "./searchResponse.js";

const emptyPage: SearchPage = {
  items: [],
  total: 0,
  totalPages: 0,
  facets: { topic: [], tag: [], format: [], type: [], site: [] },
};
const initial: SearchView = { state: emptyState(), page: emptyPage, loading: false, failed: false };

const driverState = (patch: Partial<DriverState>): DriverState =>
  ({
    searchTerm: "",
    current: 1,
    filters: [],
    wasSearched: false,
    isLoading: false,
    error: "",
    results: [],
    totalResults: 0,
    totalPages: 0,
    facets: {},
    ...patch,
  }) as unknown as DriverState;

/** A driver that records the actions and lets the test push states. */
const fakeDriver = () => {
  const subscribers: ((state: DriverState) => void)[] = [];
  const calls: [string, ...unknown[]][] = [];
  const driver = {
    actions: {
      setSearchTerm: (...args: unknown[]) => calls.push(["setSearchTerm", ...args]),
      addFilter: (...args: unknown[]) => calls.push(["addFilter", ...args]),
      removeFilter: (...args: unknown[]) => calls.push(["removeFilter", ...args]),
      clearFilters: (...args: unknown[]) => calls.push(["clearFilters", ...args]),
      setCurrent: (...args: unknown[]) => calls.push(["setCurrent", ...args]),
    },
    subscribeToStateChanges: (cb: (state: DriverState) => void) => subscribers.push(cb),
    unsubscribeToStateChanges: vi.fn(),
    tearDown: vi.fn(),
    getState: () => driverState({}),
  } as unknown as SearchDriver;
  return { driver, calls, push: (state: DriverState) => subscribers.forEach((cb) => cb(state)) };
};

const connector = {
  onAutocomplete: vi.fn(async () => ({
    autocompletedResults: [
      { id: { raw: "1" }, title: { raw: "A story" }, url: { raw: "/a.html" } },
    ],
    autocompletedResultsRequestId: "",
    autocompletedSuggestions: { tag: [{ suggestion: "carbon" }] },
    autocompletedSuggestionsRequestId: "",
  })),
} as unknown as APIConnector;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("viewOf", () => {
  it("keeps the server's page until the driver has searched", () => {
    const fallback = { ...emptyPage, total: 5 };
    expect(viewOf(driverState({}), fallback).page.total).toBe(5);
    const searched = viewOf(driverState({ wasSearched: true, totalResults: 2 }), fallback);
    expect(searched.page.total).toBe(2);
  });

  it("reads the state back from the driver and reports loading and failure", () => {
    const view = viewOf(
      driverState({
        searchTerm: "fast",
        current: 2,
        isLoading: true,
        error: "An unexpected error occurred",
        filters: [{ field: "tag", type: "any", values: ["carbon"] }],
      }),
      emptyPage,
    );
    expect(view.state).toMatchObject({ q: "fast", page: 2, tag: ["carbon"] });
    expect(view.loading).toBe(true);
    expect(view.failed).toBe(true);
  });
});

describe("createSearchStore", () => {
  it("shows the server's page, then follows the driver", async () => {
    const { driver, push } = fakeDriver();
    const store = createSearchStore({
      initial,
      connector,
      size: 10,
      loadDriver: async () => () => driver,
    });
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.getSnapshot()).toBe(initial);
    store.start();
    await flush();
    expect(listener).toHaveBeenCalled();
    push(driverState({ searchTerm: "fast", wasSearched: true, totalResults: 3 }));
    expect(store.getSnapshot().state.q).toBe("fast");
    expect(store.getSnapshot().page.total).toBe(3);
  });

  it("keeps the actions taken before the driver loaded and runs them in order", async () => {
    const { driver, calls } = fakeDriver();
    const store = createSearchStore({
      initial,
      connector,
      size: 10,
      loadDriver: async () => () => driver,
    });
    store.actions.toggle("tag", "carbon", true);
    store.actions.setQuery("fast");
    store.start();
    await flush();
    expect(calls).toEqual([
      ["addFilter", "tag", "carbon", "any"],
      ["setSearchTerm", "fast", { shouldClearFilters: false }],
    ]);
    store.actions.toggle("tag", "carbon", false);
    store.actions.setPage(2);
    store.actions.clearFilters();
    expect(calls.slice(2)).toEqual([
      ["removeFilter", "tag", "carbon", "any"],
      ["setCurrent", 2],
      ["clearFilters"],
    ]);
  });

  it("tears the driver down on stop, and ignores a driver that loads after it", async () => {
    const first = fakeDriver();
    const store = createSearchStore({
      initial,
      connector,
      size: 10,
      loadDriver: async () => () => first.driver,
    });
    store.start();
    store.stop();
    await flush();
    expect(first.driver.tearDown).not.toHaveBeenCalled();
    store.start();
    await flush();
    store.stop();
    expect(first.driver.tearDown).toHaveBeenCalledTimes(1);
  });

  it("stays on the server's page when the driver cannot load", async () => {
    const store = createSearchStore({
      initial,
      connector,
      size: 10,
      loadDriver: async () => {
        throw new Error("offline");
      },
    });
    store.start();
    await flush();
    expect(store.getSnapshot()).toBe(initial);
  });

  it("suggests through the connector, and gives none when it fails", async () => {
    const store = createSearchStore({
      initial,
      connector,
      size: 10,
      loadDriver: async () => () => fakeDriver().driver,
    });
    expect(await store.actions.suggest("car")).toEqual([
      { kind: "result", id: "1", title: "A story", url: "/a.html" },
      { kind: "tag", value: "carbon" },
    ]);
    const failing = {
      onAutocomplete: vi.fn(async () => {
        throw new Error("down");
      }),
    } as unknown as APIConnector;
    const broken = createSearchStore({
      initial,
      connector: failing,
      size: 10,
      loadDriver: async () => () => fakeDriver().driver,
    });
    expect(await broken.actions.suggest("car")).toEqual([]);
  });
});
