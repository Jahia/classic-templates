/**
 * BCP 47 tag of a java.util.Locale ("fr", "fr-CA"), for lang / hreflang and Intl. Jahia locale keys
 * can be regional with an underscore ("fr_CA"), which is not valid BCP 47. The library's Locale
 * typings omit toLanguageTag(), which the Java class has.
 */
export const languageTag = (locale: unknown): string =>
  (locale as { toLanguageTag(): string }).toLanguageTag();
