import { describe, expect, it } from "vitest";
import { shownLanguages, textDirection } from "./locale.js";

describe("textDirection", () => {
  it("is right to left for Arabic, Hebrew, Persian and Urdu, regional or not", () => {
    for (const tag of ["ar", "ar-AE", "ar_SA", "AR-eg", "he", "fa-IR", "ur"]) {
      expect(textDirection(tag)).toBe("rtl");
    }
  });

  it("is left to right for every other language", () => {
    for (const tag of ["en", "fr-CA", "pt", "ja", "zh-Hant", "arn", ""]) {
      expect(textDirection(tag)).toBe("ltr");
    }
  });
});

describe("shownLanguages", () => {
  it("keeps the languages the node is translated into", () => {
    expect(shownLanguages(["en", "fr", "ar"], (l) => l !== "fr")).toEqual(["en", "ar"]);
  });

  it("offers every language for a node translated into none (shared fields, external data)", () => {
    expect(shownLanguages(["en", "ar"], () => false)).toEqual(["en", "ar"]);
  });

  it("is empty only when the site has no language", () => {
    expect(shownLanguages([], () => false)).toEqual([]);
  });
});
