import { describe, expect, it } from "vitest";
import {
  emptyState,
  isAsked,
  LIMITS,
  mergeQuery,
  normalizeTag,
  normalizeTopic,
  queryToState,
  stateToQuery,
  stateUrl,
  tagState,
  withFacet,
  withoutFilters,
  type SearchState,
} from "./searchState.js";

const full: SearchState = {
  q: "fast channels & ads",
  page: 3,
  topic: ["streaming/fast-channels", "ai"],
  tag: ["orvane live 2027", "carbon"],
  format: ["news", "keynote"],
  type: ["story", "page"],
  site: ["orvane-signal"],
};

describe("stateToQuery and queryToState", () => {
  it("round-trips a full state", () => {
    expect(queryToState(stateToQuery(full))).toEqual(full);
  });

  it("round-trips the empty state to an empty query", () => {
    expect(stateToQuery(emptyState())).toBe("");
    expect(queryToState("")).toEqual(emptyState());
    expect(queryToState("?")).toEqual(emptyState());
  });

  it("keeps topic slashes readable and leaves out the default page", () => {
    expect(stateToQuery({ ...emptyState(), topic: ["streaming/fast-channels"] })).toBe(
      "topic=streaming/fast-channels",
    );
    expect(stateToQuery({ ...emptyState(), q: "a", page: 1 })).toBe("q=a");
  });

  it("repeats a parameter for each value, in order", () => {
    expect(stateToQuery({ ...emptyState(), tag: ["b", "a"] })).toBe("tag=b&tag=a");
  });

  it("reads + as a space and skips malformed pairs", () => {
    expect(queryToState("q=fast+channels&tag=%E0%A4%A&tag=ok").q).toBe("fast channels");
    expect(queryToState("q=fast&tag=%E0%A4%A&tag=ok").tag).toEqual(["ok"]);
  });
});

describe("validation", () => {
  it("drops unknown formats, types and malformed sites", () => {
    const state = queryToState("format=news&format=nope&type=story&type=file&site=a%20b&site=ok");
    expect(state.format).toEqual(["news"]);
    expect(state.type).toEqual(["story"]);
    expect(state.site).toEqual(["ok"]);
  });

  it("lower-cases tags, collapses spaces, drops repeats and empties", () => {
    expect(queryToState("tag=FAST&tag=fast&tag=%20&tag=Led%20%20Volume").tag).toEqual([
      "fast",
      "led volume",
    ]);
    expect(normalizeTag("x".repeat(LIMITS.tagLength + 1))).toBeUndefined();
  });

  it("accepts category paths only", () => {
    expect(normalizeTopic("/streaming/fast-channels/")).toBe("streaming/fast-channels");
    expect(normalizeTopic("a/../b")).toBeUndefined();
    expect(normalizeTopic("a//b")).toBeUndefined();
    expect(normalizeTopic("a/b c")).toBeUndefined();
    expect(normalizeTopic("a.*")).toBeUndefined();
    expect(normalizeTopic("v1.2")).toBe("v1.2");
    expect(normalizeTopic("a/b/c/d/e/f/g")).toBeUndefined();
    expect(normalizeTopic("x".repeat(LIMITS.topicLength + 1))).toBeUndefined();
  });

  it("caps the words, the page and each list", () => {
    const many = Array.from({ length: 30 }, (_, i) => `tag=t${i}`).join("&");
    expect(queryToState(many).tag).toHaveLength(LIMITS.tags);
    expect(queryToState(`q=${"w".repeat(500)}`).q).toHaveLength(LIMITS.words);
    expect(queryToState("page=0").page).toBe(1);
    expect(queryToState("page=abc").page).toBe(1);
    expect(queryToState("page=5000").page).toBe(1);
    expect(queryToState("page=7").page).toBe(7);
  });

  it("ignores foreign parameters", () => {
    expect(queryToState("lang=fr&utm_source=x")).toEqual(emptyState());
  });
});

describe("helpers", () => {
  it("merges the state's query with the parameters it does not own", () => {
    expect(mergeQuery("?lang=fr&q=old&tag=x&page=2", "q=new")).toBe("lang=fr&q=new");
    expect(mergeQuery("?q=old", "")).toBe("");
  });

  it("adds the query to a path that may have one", () => {
    expect(stateUrl("/search.html", tagState("Fast"))).toBe("/search.html?tag=fast");
    expect(stateUrl("/search.html?lang=fr", tagState("fast"))).toBe(
      "/search.html?lang=fr&tag=fast",
    );
    expect(stateUrl("/search.html", emptyState())).toBe("/search.html");
  });

  it("knows when something is asked", () => {
    expect(isAsked(emptyState())).toBe(false);
    expect(isAsked({ ...emptyState(), q: "a" })).toBe(true);
    expect(isAsked({ ...emptyState(), site: ["s"] })).toBe(true);
  });

  it("goes back to page 1 when a facet or the filters change", () => {
    expect(withFacet(full, "tag", ["x"]).page).toBe(1);
    expect(withFacet(full, "tag", ["x", "x"]).tag).toEqual(["x"]);
    const cleared = withoutFilters(full);
    expect(cleared.q).toBe(full.q);
    expect(cleared.page).toBe(1);
    expect(cleared.topic).toEqual([]);
  });
});
