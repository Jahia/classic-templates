/**
 * BCP 47 tag of a java.util.Locale ("fr", "fr-CA"), for lang / hreflang and Intl. Jahia locale keys
 * can be regional with an underscore ("fr_CA"), which is not valid BCP 47. The library's Locale
 * typings omit toLanguageTag(), which the Java class has.
 */
export const languageTag = (locale: unknown): string =>
  (locale as { toLanguageTag(): string }).toLanguageTag();

/** Languages written right to left (ISO 639 codes, the language part of a tag only). */
const RTL_LANGUAGES = new Set([
  "ar",
  "arc",
  "ckb",
  "dv",
  "fa",
  "he",
  "ks",
  "ku",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

/**
 * Writing direction of a BCP 47 tag ("ar", "ar-AE", "fr"): `<html dir>` mirrors the whole page
 * for Arabic and the other right-to-left languages, the CSS using logical properties only.
 */
export const textDirection = (tag: string): "rtl" | "ltr" =>
  RTL_LANGUAGES.has(tag.split(/[-_]/)[0].toLowerCase()) ? "rtl" : "ltr";
