import { buildNodeUrl, jahiaComponent, server } from "@jahia/javascript-modules-library";
import { usePageLabels } from "../../../lib/pageLabels.js";
import classes from "./language-switcher.module.css";
import { languageNames } from "../../../lib/languageName.js";
import { languageTag } from "../../../lib/locale.js";
import { pageSite } from "../../../lib/site.js";

/**
 * Links to the page being viewed in the site's other languages, only those the page is translated
 * into. Renders nothing on a one-language site.
 *
 * It sits in the shared header, whose cached fragment is otherwise the same on every page, so its
 * cache key includes the main resource (`cache.mainResource`): each page gets its own links. The
 * main node is also a dependency: publishing a new translation of the page updates its switcher.
 *
 * Each link shows the language's own name ("English", "繁體中文", "简体中文"; lib/languageName.ts),
 * which is also its accessible name, read in that language thanks to `lang` on the link.
 *
 * Site locale keys can be regional ("fr_CA"): BCP 47 tags (toLanguageTag, "fr-CA") are used for
 * hreflang, lang and case mapping, and the current page is matched on the full locale.
 *
 * The languages are those of the page's own site, never getSiteLocales(): it reads
 * renderContext.getSite(), which in live is the site named after the request host when there is
 * one, another site than the page's when several sites are served under one host (Jahia Cloud).
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctpl:languageSwitcher",
    displayName: "Language switcher",
    properties: { "cache.mainResource": "true" },
  },
  (_, { mainNode, currentResource, renderContext }) => {
    const { t } = usePageLabels();
    server.render.addCacheDependency({ node: mainNode }, renderContext);
    const current = currentResource.getLocale().toString();
    const invalid = new Set<string>(
      mainNode.hasProperty("j:invalidLanguages")
        ? mainNode
            .getProperty("j:invalidLanguages")
            .getValues()
            .map((v: { getString(): string }) => v.getString())
        : [],
    );
    const site = pageSite(renderContext);
    const locales = renderContext.isLiveMode()
      ? site.getActiveLiveLanguagesAsLocales()
      : site.getLanguagesAsLocales();
    const offered = locales.filter(
      (locale) => !invalid.has(locale.toString()) && mainNode.hasI18N(locale),
    );
    const names = languageNames(
      offered.map((locale) => ({
        tag: languageTag(locale),
        language: locale.getDisplayLanguage(locale),
        country: locale.getDisplayCountry(locale),
      })),
    );
    const links = offered.map((locale, index) => ({
      code: locale.toString(),
      tag: languageTag(locale),
      current: locale.toString() === current,
      name: names[index],
      href: buildNodeUrl(mainNode, { language: locale.toString() }),
    }));
    if (links.length < 2) return null;

    return (
      <nav aria-label={t("lang.label")} data-testid="ctpl-language-switcher">
        <ul className={classes.list}>
          {links.map(({ code, tag, current: isCurrent, name, href }) => (
            <li key={code}>
              <a
                className={classes.link}
                href={href}
                hrefLang={tag}
                lang={tag}
                aria-current={isCurrent ? "true" : undefined}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  },
);
