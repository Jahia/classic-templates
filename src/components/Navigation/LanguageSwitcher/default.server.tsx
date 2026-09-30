import { buildNodeUrl, getSiteLocales, jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import classes from "./language-switcher.module.css";

const capitalise = (s: string, lang: string) => s.charAt(0).toLocaleUpperCase(lang) + s.slice(1);

/**
 * Links to the page being viewed in the site's other languages, only those the page is translated
 * into. Renders nothing on a one-language site.
 *
 * It sits in the shared header, whose cached fragment is otherwise the same on every page, so its
 * cache key includes the main resource (`cache.mainResource`): each page gets its own links.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctpl:languageSwitcher",
    displayName: "Language switcher",
    properties: { "cache.mainResource": "true" },
  },
  (_, { mainNode, currentResource }) => {
    const { t } = useTranslation();
    const current = currentResource.getLocale().getLanguage();
    const invalid = new Set<string>(
      mainNode.hasProperty("j:invalidLanguages")
        ? mainNode
            .getProperty("j:invalidLanguages")
            .getValues()
            .map((v: { getString(): string }) => v.getString())
        : [],
    );
    const links = Object.entries(getSiteLocales())
      .filter(([code, locale]) => !invalid.has(code) && mainNode.hasI18N(locale))
      .map(([code, locale]) => ({
        code,
        name: capitalise(locale.getDisplayLanguage(locale), code),
        href: buildNodeUrl(mainNode, { language: code }),
      }));
    if (links.length < 2) return null;

    return (
      <nav aria-label={t("lang.label")} data-testid="ctpl-language-switcher">
        <ul className={classes.list}>
          {links.map(({ code, name, href }) => (
            <li key={code}>
              <a
                className={classes.link}
                href={href}
                hrefLang={code}
                lang={code}
                aria-current={code === current ? "true" : undefined}
              >
                <span aria-hidden="true">{code.toUpperCase()}</span>
                <span className="ctpl-visually-hidden">{name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  },
);
