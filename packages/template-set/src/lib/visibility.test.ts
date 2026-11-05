import { describe, expect, it } from "vitest";
import { languageVisibility } from "./visibility.js";

describe("languageVisibility", () => {
  const site = ["en", "ja", "zh"];

  it("shows every language when nothing is switched off", () => {
    expect(languageVisibility([], site)).toEqual({ shown: site, hidden: [] });
  });

  it("splits the site's languages, by code", () => {
    expect(languageVisibility(["ja", "en"], ["zh", "ja", "en"])).toEqual({
      shown: ["zh"],
      hidden: ["en", "ja"],
    });
  });

  it("puts the default language first", () => {
    expect(languageVisibility(["en", "ja"], ["en", "ja", "zh"], "zh").hidden).toEqual(["en", "ja"]);
    expect(languageVisibility(["en", "ja", "zh"], ["en", "ja", "zh"], "ja").hidden).toEqual([
      "ja",
      "en",
      "zh",
    ]);
  });

  it("ignores a language the site no longer has", () => {
    expect(languageVisibility(["fr"], site)).toEqual({ shown: site, hidden: [] });
  });

  it("can switch off every language", () => {
    expect(languageVisibility(site, site)).toEqual({ shown: [], hidden: site });
  });
});
