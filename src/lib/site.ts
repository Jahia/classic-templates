import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { JCRSiteNode } from "org.jahia.services.content.decorator";

/** Themes declared by the ctplmix:siteSettings choicelist, besides the implicit default. */
const THEMES = new Set(["ocean", "terracotta"]);
const SCHEMES = new Set(["light", "dark"]);

export interface SiteLook {
  /** Stamped as <html data-ctpl-theme>; undefined for the default theme (the :root tokens). */
  theme?: string;
  /** Stamped as <html data-ctpl-scheme>; undefined for "auto" (follow the visitor's system). */
  scheme?: string;
}

/**
 * Reads the site's theme and colour scheme from the ctplmix:siteSettings mixin.
 *
 * The mixin is optional (an administrator switches it on in the site's edit form), so this never
 * assumes it is there, and only returns values the stylesheet knows: an unknown value falls back
 * to the default look rather than producing an attribute no CSS matches.
 */
export const readSiteLook = (site: JCRSiteNode): SiteLook => {
  if (!site.isNodeType("ctplmix:siteSettings")) return {};
  const theme = site.hasProperty("ctplTheme") ? site.getProperty("ctplTheme").getString() : "";
  const scheme = site.hasProperty("ctplColorScheme")
    ? site.getProperty("ctplColorScheme").getString()
    : "";
  return {
    theme: THEMES.has(theme) ? theme : undefined,
    scheme: SCHEMES.has(scheme) ? scheme : undefined,
  };
};

/**
 * The node that owns the shared header and footer areas: the site's home page.
 *
 * Not the site node: it renders on every page too, but it is not a page, so Page Builder never
 * offers it and chrome parented there could not be edited from the UI. Owned by the home page,
 * an editor opens the home page to change it. Falls back to the site node only while the home
 * page does not exist yet (a site being created), so the shell still renders.
 */
export const chromeOwner = (site: JCRSiteNode): JCRNodeWrapper => {
  try {
    return site.getHome() ?? site;
  } catch {
    return site;
  }
};
