import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import browse from "./__fixtures__/search-browse.json";
import { createSearchConnector } from "./searchConnector.js";
import { createDriver } from "./searchDriver.js";
import type { QueryContext } from "./searchQuery.js";

const context: QueryContext = {
  language: "en",
  workspace: "LIVE",
  sites: ["orvane-signal", "orvane-live"],
  size: 10,
};

/** A browser's address bar and history, enough for the driver's routing. */
const fakeBrowser = (search: string) => {
  const location = { search, pathname: "/sites/s/home/search.html", hash: "" };
  const writes: { how: string; target: string }[] = [];
  const listeners: Record<string, () => void> = {};
  const write = (how: string) => (_state: unknown, _title: string, target: string) => {
    writes.push({ how, target });
    location.search = target.includes("?") ? `?${target.split("?")[1]}` : "";
  };
  vi.stubGlobal("location", location);
  vi.stubGlobal("history", { pushState: write("push"), replaceState: write("replace") });
  vi.stubGlobal("addEventListener", (name: string, handler: () => void) => {
    listeners[name] = handler;
  });
  vi.stubGlobal("removeEventListener", (name: string) => {
    delete listeners[name];
  });
  return { location, writes, listeners };
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 5));

/** A connector whose server always answers with the browse fixture; records the posts. */
const connector = () => {
  const fetchImpl = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ data: browse }),
  })) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
  return { fetchImpl, connector: createSearchConnector({ endpoint: "/g", context, fetchImpl }) };
};

afterEach(() => vi.unstubAllGlobals());

describe("createDriver", () => {
  let browser: ReturnType<typeof fakeBrowser>;
  beforeEach(() => {
    browser = fakeBrowser("?lang=fr&q=fast&tag=Carbon&tag=carbon&format=nope&page=2");
  });

  it("starts from the address: its state, its search, the canonical address kept with lang", async () => {
    const { connector: api, fetchImpl } = connector();
    const driver = createDriver({ connector: api, size: 10 });
    await settle();
    const state = driver.getState();
    expect(state.searchTerm).toBe("fast");
    expect(state.current).toBe(2);
    expect(state.filters).toEqual([{ field: "tag", type: "any", values: ["carbon"] }]);
    expect(state.wasSearched).toBe(true);
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    const sent = JSON.parse(init.body as string);
    expect(sent.variables).toMatchObject({ q: "fast", page: 1, size: 10 });
    expect(browser.writes.at(-1)).toEqual({
      how: "replace",
      target: "/sites/s/home/search.html?lang=fr&q=fast&tag=carbon&page=2",
    });
    driver.tearDown();
  });

  it("pushes a history entry per change, back on page 1, and keeps foreign parameters", async () => {
    const { connector: api } = connector();
    const driver = createDriver({ connector: api, size: 10 });
    await settle();
    driver.actions.addFilter("topic", "streaming/fast-channels", "any");
    await settle();
    expect(browser.writes.at(-1)).toEqual({
      how: "push",
      target: "/sites/s/home/search.html?lang=fr&q=fast&topic=streaming/fast-channels&tag=carbon",
    });
    driver.actions.removeFilter("tag", "carbon", "any");
    await settle();
    expect(browser.location.search).toBe("?lang=fr&q=fast&topic=streaming/fast-channels");
    driver.actions.clearFilters();
    await settle();
    expect(browser.location.search).toBe("?lang=fr&q=fast");
    driver.actions.setSearchTerm("slow", { shouldClearFilters: false });
    await settle();
    expect(browser.location.search).toBe("?lang=fr&q=slow");
    driver.tearDown();
  });

  it("follows the back button (popstate) without writing the address again", async () => {
    const { connector: api } = connector();
    const driver = createDriver({ connector: api, size: 10 });
    await settle();
    const before = browser.writes.length;
    browser.location.search = "?q=other&type=story";
    browser.listeners.popstate?.();
    await settle();
    expect(driver.getState().searchTerm).toBe("other");
    expect(driver.getState().filters).toEqual([{ field: "type", type: "any", values: ["story"] }]);
    expect(browser.writes).toHaveLength(before);
    driver.tearDown();
    expect(browser.listeners.popstate).toBeUndefined();
  });
});
