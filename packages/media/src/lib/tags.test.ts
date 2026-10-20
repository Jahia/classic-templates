import { describe, expect, it } from "vitest";
import { tagSearchUrl } from "./tags.js";

describe("tagSearchUrl", () => {
  it("names the tag in the search page's q parameter", () => {
    expect(tagSearchUrl("/sites/s/home/search.html", "AI & ads")).toBe(
      "/sites/s/home/search.html?q=AI%20%26%20ads",
    );
    expect(tagSearchUrl("/search.html?lang=fr", "FAST")).toBe("/search.html?lang=fr&q=FAST");
  });
});
