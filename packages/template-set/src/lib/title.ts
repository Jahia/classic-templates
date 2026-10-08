import type { JCRNodeWrapper } from "org.jahia.services.content";
import { readString } from "./props.js";

interface LanguageCodeConverters {
  languageCodeToLocale(code: string): unknown;
}

interface SessionFactory {
  getInstance(): {
    getCurrentUserSession(
      workspace: string,
      locale: unknown,
    ): { getNodeByIdentifier(id: string): JCRNodeWrapper };
  };
}

/**
 * The jcr:title of `node` in the site's default language, read through a session in that
 * language (translation nodes are not meant to be read from a localized session). Undefined when
 * the rendering language is the default one, when that title is empty, or on any error.
 */
const defaultLanguageTitle = (node: JCRNodeWrapper): string | undefined => {
  try {
    const language = node.getResolveSite().getDefaultLanguage();
    const session = node.getSession();
    if (!language || String(session.getLocale()) === language) return undefined;
    const locale = Java.type<LanguageCodeConverters>(
      "org.jahia.utils.LanguageCodeConverters",
    ).languageCodeToLocale(language);
    const other = Java.type<SessionFactory>("org.jahia.services.content.JCRSessionFactory")
      .getInstance()
      .getCurrentUserSession(session.getWorkspace().getName(), locale);
    return readString(other.getNodeByIdentifier(node.getIdentifier()), "jcr:title");
  } catch {
    return undefined;
  }
};

/**
 * The title menus, links and the breadcrumb show for `node`: its jcr:title in the rendering
 * language, else its jcr:title in the site's default language, else undefined.
 *
 * A language added to a site starts with no page titles, and translating a page does not
 * translate the links pointing at it. Without this fallback a visitor sees system names
 * ("partner-offers") in the menu and URLs as link text; with it they see the default-language
 * title until the translation reaches that page.
 */
export const titleOf = (node: JCRNodeWrapper): string | undefined =>
  readString(node, "jcr:title") ?? defaultLanguageTitle(node);
