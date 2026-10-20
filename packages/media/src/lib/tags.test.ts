import { describe, expect, it } from "vitest";
import { tagFilterUrl } from "./tags.js";

describe("tagFilterUrl", () => {
  it("names the tag in the search page's tag parameter, as Jahia stores tags", () => {
    expect(tagFilterUrl("/sites/s/home/search.html", "AI & ads")).toBe(
      "/sites/s/home/search.html?tag=ai%20%26%20ads",
    );
    expect(tagFilterUrl("/search.html?lang=fr", "FAST")).toBe("/search.html?lang=fr&tag=fast");
  });

  it("gives the page itself for a tag that cannot be one", () => {
    expect(tagFilterUrl("/search.html", "   ")).toBe("/search.html");
  });
});
