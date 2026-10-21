import { describe, expect, it } from "vitest";
import type { RenderContext } from "org.jahia.services.render";
import cnd from "../../settings/definitions.cnd?raw";
import en from "../../settings/resources/classic-templates_en.properties?raw";
import fr from "../../settings/resources/classic-templates_fr.properties?raw";
import { NOINDEX_DIRECTIVE, pageSite, readSiteLook, robotsDirective } from "./site.js";

/** A site node with the given mixins and properties (a string, or a boolean for getBoolean). */
const settingsSite = (props: Record<string, string | boolean>, mixin = true) =>
  ({
    isNodeType: (type: string) => mixin && type === "ctplmix:siteSettings",
    hasProperty: (name: string) => name in props,
    getProperty: (name: string) => ({
      getString: () => String(props[name]),
      getBoolean: () => props[name] === true,
    }),
  }) as never;

const site = (key: string) => ({ getSiteKey: () => key }) as never;
const context = (requestSite: string, pageSiteKey?: string, throws = false) =>
  ({
    getSite: () => site(requestSite),
    getMainResource: () => {
      if (throws) throw new Error("no main resource");
      return pageSiteKey === undefined
        ? undefined
        : { getNode: () => ({ getResolveSite: () => site(pageSiteKey) }) };
    },
  }) as unknown as RenderContext;

const keyOf = (s: unknown) => (s as { getSiteKey: () => string }).getSiteKey();

describe("pageSite", () => {
  it("returns the site of the page, not the one resolved from the request", () => {
    expect(keyOf(pageSite(context("classic-dev", "skylantern")))).toBe("skylantern");
  });

  it("falls back to the request's site without a main resource", () => {
    expect(keyOf(pageSite(context("classic-dev")))).toBe("classic-dev");
    expect(keyOf(pageSite(context("classic-dev", undefined, true)))).toBe("classic-dev");
  });
});

/** A site carrying a theme module's mixin (`name`, declared by `module`), with or without settings. */
const providerSite = (name: string, module: string, props: Record<string, string> = {}) => {
  const mixin = {
    getName: () => name,
    getLocalName: () => name.split(":")[1],
    getSystemId: () => module,
    isNodeType: (type: string) => type === "ctplmix:themeProvider" || type === name,
  };
  const hasSettings = Object.keys(props).length > 0;
  return {
    isNodeType: (type: string) =>
      type === "ctplmix:themeProvider" || (hasSettings && type === "ctplmix:siteSettings"),
    getMixinNodeTypes: () => [
      { ...mixin, getName: () => "jmix:accessControlled", isNodeType: () => false },
      mixin,
    ],
    hasProperty: (prop: string) => prop in props,
    getProperty: (prop: string) => ({ getString: () => props[prop] }),
  } as never;
};

describe("readSiteLook with a theme from another module", () => {
  it("takes the theme key from the mixin and the module from its definition", () => {
    expect(readSiteLook(providerSite("acmemix:acme", "acme-theme"))).toEqual({
      theme: "acme",
      themeModule: "acme-theme",
    });
  });

  it("wins over the ctplTheme choice and keeps the colour scheme", () => {
    expect(
      readSiteLook(
        providerSite("acmemix:acme", "acme-theme", { ctplTheme: "sage", ctplColorScheme: "dark" }),
      ),
    ).toEqual({ theme: "acme", themeModule: "acme-theme", scheme: "dark" });
  });

  it("ignores a mixin whose name is not a plain CSS identifier", () => {
    expect(readSiteLook(providerSite("acmemix:Acme_Theme", "acme-theme"))).toEqual({});
  });

  it("declares the provider mixin without properties, with labels in every language", () => {
    expect(cnd).toMatch(/^\[ctplmix:themeProvider\] mixin\s*$/m);
    for (const bundle of [en, fr]) expect(bundle).toMatch(/^ctplmix_themeProvider=.+$/m);
  });
});

describe("readSiteLook", () => {
  it("accepts the portal theme and the colour scheme", () => {
    expect(readSiteLook(settingsSite({ ctplTheme: "portal", ctplColorScheme: "dark" }))).toEqual({
      theme: "portal",
      scheme: "dark",
    });
  });

  it("falls back to the default look for an unknown theme or without the mixin", () => {
    expect(readSiteLook(settingsSite({ ctplTheme: "neon" }))).toEqual({
      theme: undefined,
      scheme: undefined,
    });
    expect(readSiteLook(settingsSite({ ctplTheme: "portal" }, false))).toEqual({});
  });

  it("knows every theme of the CND choicelist, and each has labels", () => {
    const line = cnd.split("\n").find((l: string) => l.includes("- ctplTheme"));
    const themes = [...(line ?? "").matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
    expect(themes).toContain("portal");
    for (const theme of themes) {
      if (theme !== "default") {
        expect(readSiteLook(settingsSite({ ctplTheme: theme })).theme).toBe(theme);
      }
      expect(en).toContain(`ctplmix_siteSettings.ctplTheme.${theme}=`);
      expect(fr).toContain(`ctplmix_siteSettings.ctplTheme.${theme}=`);
    }
  });
});

describe("robotsDirective", () => {
  it("asks search engines to neither index nor follow when the site hides itself", () => {
    expect(robotsDirective(settingsSite({ ctplNoIndex: true }))).toBe("noindex, nofollow");
    expect(NOINDEX_DIRECTIVE).toBe("noindex, nofollow");
  });

  it("emits nothing when the setting is off, never saved, or the mixin is absent", () => {
    expect(robotsDirective(settingsSite({ ctplNoIndex: false }))).toBeUndefined();
    expect(robotsDirective(settingsSite({ ctplTheme: "portal" }))).toBeUndefined();
    expect(robotsDirective(settingsSite({ ctplNoIndex: true }, false))).toBeUndefined();
  });

  it("is declared in the CND with a label and a tooltip in English and French", () => {
    expect(cnd).toContain("- ctplNoIndex (boolean) = false autocreated");
    for (const props of [en, fr]) {
      expect(props).toContain("ctplmix_siteSettings.ctplNoIndex=");
      expect(props).toContain("ctplmix_siteSettings.ctplNoIndex.ui.tooltip=");
    }
  });
});
