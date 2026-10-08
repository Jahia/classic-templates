import { afterEach, describe, expect, it, vi } from "vitest";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { titleOf } from "./title.js";

/** A node with the jcr:title of each language in `titles`, read in `language`. */
const node = (titles: Record<string, string>, language: string, defaultLanguage = "en") => {
  const make = (lang: string): JCRNodeWrapper =>
    ({
      hasProperty: (name: string) => name === "jcr:title" && Boolean(titles[lang]),
      getProperty: () => ({ getString: () => titles[lang] }),
      getIdentifier: () => "uuid-1",
      getResolveSite: () => ({ getDefaultLanguage: () => defaultLanguage }),
      getSession: () => ({
        getLocale: () => ({ toString: () => lang }),
        getWorkspace: () => ({ getName: () => "default" }),
      }),
    }) as unknown as JCRNodeWrapper;
  vi.stubGlobal("Java", {
    type: (name: string) =>
      name.endsWith("LanguageCodeConverters")
        ? { languageCodeToLocale: (code: string) => code }
        : {
            getInstance: () => ({
              getCurrentUserSession: (_workspace: string, locale: string) => ({
                getNodeByIdentifier: () => make(locale),
              }),
            }),
          },
  });
  return make(language);
};

afterEach(() => vi.unstubAllGlobals());

describe("titleOf", () => {
  it("returns the title in the rendering language", () => {
    expect(titleOf(node({ en: "Offers", zh: "優惠" }, "zh"))).toBe("優惠");
  });

  it("falls back to the default-language title when this language has none", () => {
    expect(titleOf(node({ en: "Partner offers" }, "zh"))).toBe("Partner offers");
  });

  it("returns undefined when no language has a title", () => {
    expect(titleOf(node({}, "zh"))).toBeUndefined();
    expect(titleOf(node({}, "en"))).toBeUndefined();
  });

  it("returns undefined instead of failing when the other session cannot be opened", () => {
    const untitled = node({ en: "Offers" }, "zh");
    vi.stubGlobal("Java", {
      type: () => {
        throw new Error("no Java");
      },
    });
    expect(titleOf(untitled)).toBeUndefined();
  });
});
