import {
  AddResources,
  buildModuleFileUrl,
  buildNodeUrl,
  jahiaComponent,
  server,
} from "@jahia/javascript-modules-library";
import { usePageLabels } from "../../../lib/pageLabels.js";
import classes from "./language-switcher.module.css";
import { languageNames } from "../../../lib/languageName.js";
import { languageTag } from "../../../lib/locale.js";
import { pageSite } from "../../../lib/site.js";

/** A globe, drawn in the text colour (currentColor), so every theme and scheme colours it. */
const Globe = () => (
  <svg
    className={classes.globe}
    viewBox="0 0 16 16"
    width="16"
    height="16"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M1.75 8h12.5M8 1.75c1.8 1.7 2.7 3.8 2.7 6.25S9.8 12.55 8 14.25C6.2 12.55 5.3 10.45 5.3 8S6.2 3.45 8 1.75"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    />
  </svg>
);

/** A chevron that turns when the list is open. */
const Chevron = () => (
  <svg
    className={classes.chevron}
    viewBox="0 0 16 16"
    width="12"
    height="12"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/**
 * A drop-down list of the page being viewed in the site's languages, only those the page is
 * translated into. Renders nothing on a one-language site.
 *
 * A native disclosure (`details` / `summary`): the button shows the current language's name and
 * opens without JavaScript; the list holds a link per language, the current one marked with
 * aria-current. static/js/language-switcher.js only closes it on Escape (focus back on the
 * button), on a click outside and when focus leaves it. Colours, radius and shadow are the theme's
 * tokens, so every theme and scheme draws it.
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
    const currentName = links.find((link) => link.current)?.name;

    return (
      <nav aria-label={t("lang.label")} data-testid="ctpl-language-switcher">
        <AddResources
          type="javascript"
          resources={buildModuleFileUrl("static/js/language-switcher.js")}
          key="ctpl-language-switcher"
        />
        <details className={classes.menu} data-ctpl-lang-menu>
          <summary className={classes.toggle}>
            <Globe />
            <span>{currentName ?? t("lang.label")}</span>
            <Chevron />
          </summary>
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
        </details>
      </nav>
    );
  },
);
