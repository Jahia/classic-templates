import { describe, expect, it } from "vitest";
import { tagFilterUrl } from "./tagFilter.js";

describe("tagFilterUrl", () => {
  it("names the tag in the tag parameter, lower-cased as Jahia stores tags", () => {
    expect(tagFilterUrl("/sites/s/home/search.html", "AI & ads")).toBe(
      "/sites/s/home/search.html?tag=ai%20%26%20ads",
    );
    expect(tagFilterUrl("/search.html?lang=fr", "Led  Volume")).toBe(
      "/search.html?lang=fr&tag=led%20volume",
    );
  });

  it("gives the page itself for an empty tag", () => {
    expect(tagFilterUrl("/search.html", "  ")).toBe("/search.html");
  });
});
