import { useTranslation } from "react-i18next";

/** The i18next namespace of the module's locale files (`settings/locales/`). */
export const NAMESPACE = "classic-templates";

/** Top-level key of `zh.json` that holds the Traditional Chinese copy of every label. */
export const TRADITIONAL_CHINESE = "zh-Hant";

/** Regions whose Chinese is written in Traditional characters when the locale names no script. */
const TRADITIONAL_REGIONS = new Set(["hk", "mo", "tw"]);

/**
 * Whether a locale is Chinese written in Traditional characters: a Jahia locale key ("zh_HK") or a
 * BCP 47 tag ("zh-Hant", "zh-Hant-HK", "zh-TW"). An explicit script wins over the region; "zh" and
 * "zh_CN" are Simplified.
 */
export const isTraditionalChinese = (locale: string): boolean => {
  const [language, ...subtags] = locale.toLowerCase().split(/[-_]/);
  if (language !== "zh") return false;
  if (subtags.includes("hant")) return true;
  if (subtags.includes("hans")) return false;
  return subtags.some((subtag) => TRADITIONAL_REGIONS.has(subtag));
};

/**
 * The module's `t()` for a locale, in place of `useTranslation("classic-templates")`.
 *
 * The JavaScript modules engine reads one locale file per language and ignores the region: every
 * Chinese page, `zh_HK` included, gets `zh.json`, on the server and in the islands (a `zh_HK.json`
 * is never read). So `zh.json` holds the Simplified labels at its root and their Traditional copy
 * under `zh-Hant`, and this hook prefixes the keys with it for a Traditional Chinese locale.
 *
 * It has no server import, so islands can call it: they get the page's locale as a prop
 * (`currentResource.getLocale().toString()`). Server components call `usePageLabels()`.
 */
export const useLabels = (locale: string) =>
  useTranslation(NAMESPACE, {
    keyPrefix: isTraditionalChinese(locale) ? TRADITIONAL_CHINESE : undefined,
  });
