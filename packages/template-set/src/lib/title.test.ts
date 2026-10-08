import { afterEach, describe, expect, it, vi } from "vitest";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { titleOf } from "./title.js";

type Titles = Record<string, string>;

const workspace = { getName: () => "default" };
const sessionIn = (lang: string) => ({ getLocale: () => lang, getWorkspace: () => workspace });
const siteWith = (defaultLanguage: string) => ({ getDefaultLanguage: () => defaultLanguage });

/** The node with the jcr:title of each language in `titles`, read in `lang`. */
const nodeIn = (titles: Titles, lang: string, defaultLanguage: string): JCRNodeWrapper => {
  const title = titles[lang];
  const property = { getString: () => title };
  const site = siteWith(defaultLanguage);
  const session = sessionIn(lang);
  return {
    hasProperty: (name: string) => name === "jcr:title" && Boolean(title),
    getProperty: () => property,
    getIdentifier: () => "uuid-1",
    getResolveSite: () => site,
    getSession: () => session,
  } as unknown as JCRNodeWrapper;
};

/** Java.type as a view sees it: locales are plain codes, and a session in another language reads `titles`. */
const stubJava = (titles: Titles, defaultLanguage: string) => {
  const converters = { languageCodeToLocale: (code: string) => code };
  const openSession = (_workspace: string, locale: string) => ({
    getNodeByIdentifier: () => nodeIn(titles, locale, defaultLanguage),
  });
  const factory = { getInstance: () => ({ getCurrentUserSession: openSession }) };
  const type = (name: string) => (name.endsWith("LanguageCodeConverters") ? converters : factory);
  vi.stubGlobal("Java", { type });
};

const node = (titles: Titles, language: string, defaultLanguage = "en") => {
  stubJava(titles, defaultLanguage);
  return nodeIn(titles, language, defaultLanguage);
};

const failingJava = () => {
  throw new Error("no Java");
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
    vi.stubGlobal("Java", { type: failingJava });
    expect(titleOf(untitled)).toBeUndefined();
  });
});
