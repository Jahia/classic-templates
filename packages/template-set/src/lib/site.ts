import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { JCRSiteNode } from "org.jahia.services.content.decorator";
import type { RenderContext } from "org.jahia.services.render";

/** Themes declared by the ctplmix:siteSettings choicelist, besides the implicit default. */
const THEMES = new Set([
  "ocean",
  "terracotta",
  "horizon",
  "sage",
  "slate",
  "graphite",
  "signal",
  "live",
  "portal",
]);
const SCHEMES = new Set(["light", "dark"]);

/** The mixin a theme module's own site mixin extends (settings/definitions.cnd). */
export const THEME_PROVIDER = "ctplmix:themeProvider";
/** A theme key is stamped in an attribute selector: keep it to a plain CSS identifier. */
const THEME_KEY = /^[a-z][a-z0-9-]*$/;

export interface SiteLook {
  /** Stamped as <html data-ctpl-theme>; undefined for the default theme (the :root tokens). */
  theme?: string;
  /** Stamped as <html data-ctpl-scheme>; undefined for "auto" (follow the visitor's system). */
  scheme?: string;
  /** The module supplying the theme, whose stylesheet the Layout loads after the template set's. */
  themeModule?: string;
}

/** The node type definition's owner, as Jahia's ExtendedNodeType exposes it. */
interface ThemeMixin {
  getName(): string;
  getLocalName(): string;
  getSystemId(): string;
  isNodeType(name: string): boolean;
}

/**
 * A theme supplied by another module: the first mixin of the site that extends
 * ctplmix:themeProvider. The theme key is the mixin's local name (`acmemix:acme` gives `acme`) and
 * the module is the one that declares the mixin, so the template set never names the module.
 */
const themeFromModule = (site: JCRSiteNode): Pick<SiteLook, "theme" | "themeModule"> => {
  const mixins = site.getMixinNodeTypes() as unknown as ThemeMixin[];
  for (const mixin of mixins) {
    if (mixin.getName() === THEME_PROVIDER || !mixin.isNodeType(THEME_PROVIDER)) continue;
    const theme = mixin.getLocalName();
    const themeModule = mixin.getSystemId();
    if (THEME_KEY.test(theme) && themeModule) return { theme, themeModule };
  }
  return {};
};

/**
 * Reads the site's theme and colour scheme.
 *
 * A theme supplied by another module (a site mixin extending ctplmix:themeProvider, switched on in
 * the site's edit form once that module is enabled on the site) wins over the ctplTheme choice.
 * Otherwise the theme comes from the ctplmix:siteSettings mixin, which is optional too, so this
 * never assumes it is there and only returns values the stylesheet knows: an unknown value falls
 * back to the default look rather than producing an attribute no CSS matches.
 */
export const readSiteLook = (site: JCRSiteNode): SiteLook => {
  const provided = site.isNodeType(THEME_PROVIDER) ? themeFromModule(site) : {};
  if (!site.isNodeType("ctplmix:siteSettings")) return provided;
  const theme = site.hasProperty("ctplTheme") ? site.getProperty("ctplTheme").getString() : "";
  const scheme = site.hasProperty("ctplColorScheme")
    ? site.getProperty("ctplColorScheme").getString()
    : "";
  return {
    theme: provided.theme ?? (THEMES.has(theme) ? theme : undefined),
    themeModule: provided.themeModule,
    scheme: SCHEMES.has(scheme) ? scheme : undefined,
  };
};

/** The robots directive of a site that hides itself from search engines. */
export const NOINDEX_DIRECTIVE = "noindex, nofollow";

/**
 * The content of `<meta name="robots">` for the site, or undefined when the site does not hide
 * itself from search engines (the setting off, never saved, or the mixin not switched on): the
 * page then carries no robots tag at all and the output is unchanged.
 */
export const robotsDirective = (site: JCRSiteNode): string | undefined => {
  if (!site.isNodeType("ctplmix:siteSettings")) return undefined;
  if (!site.hasProperty("ctplNoIndex")) return undefined;
  return site.getProperty("ctplNoIndex").getBoolean() ? NOINDEX_DIRECTIVE : undefined;
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

/**
 * The site of the page being rendered. `renderContext.getSite()` is the site the instance resolved
 * from the request, which on a shared instance where several sites keep the server name localhost
 * (as Jahia Cloud needs) can be another site than the page's: theme, title, chrome and breadcrumb
 * would then come from that other site. The main resource always belongs to the page's own site.
 */
export const pageSite = (renderContext: RenderContext): JCRSiteNode => {
  try {
    const node = renderContext.getMainResource()?.getNode();
    if (node) return node.getResolveSite() ?? renderContext.getSite();
  } catch {
    // no main resource (rendering outside a page): use the request's site
  }
  return renderContext.getSite();
};
