import { describe, expect, it } from "vitest";
import { feedCategoriesSentence } from "./feedCategories.js";

describe("feedCategoriesSentence", () => {
  it("says nothing for a feed without any category", () => {
    expect(feedCategoriesSentence([], undefined)).toBeUndefined();
  });

  it("names the picked categories", () => {
    expect(feedCategoriesSentence(["AI and automation", "Edge"], undefined)).toEqual({
      key: "feed.categories",
      categories: "AI and automation, Edge",
    });
  });

  it("names the page's categories", () => {
    expect(feedCategoriesSentence([], ["Cloud and networks"])).toEqual({
      key: "feed.pageCategories",
      categories: "Cloud and networks",
    });
  });

  it("names both when the feed has picked categories and uses the page's", () => {
    expect(feedCategoriesSentence(["Edge"], ["Cloud and networks"])).toEqual({
      key: "feed.bothCategories",
      categories: "Edge",
      page: "Cloud and networks",
    });
  });

  it("warns when the page has no category, picked ones or not", () => {
    expect(feedCategoriesSentence([], [])).toEqual({ key: "feed.pageNoCategory" });
    expect(feedCategoriesSentence(["Edge"], [])).toEqual({ key: "feed.pageNoCategory" });
  });
});
