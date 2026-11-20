import { isTraditionalChinese } from "./labels.js";

/** A site language, as java.util.Locale describes it in that language itself. */
export interface OwnLocale {
  /** BCP 47 tag ("en", "zh-HK"). */
  tag: string;
  /** `locale.getDisplayLanguage(locale)`: "English", "français", "中文". */
  language: string;
  /** `locale.getDisplayCountry(locale)`: "Canada", or "" when the locale names no country. */
  country: string;
}

/**
 * Chinese is one language written two ways, and the two are what readers choose between: the names
 * they look for are these, each in its own script, in every language of the site. Java only gives
 * "中文" for both. Not locale keys: a language's own name is the same on every page.
 */
const TRADITIONAL_CHINESE_NAME = "繁體中文";
const SIMPLIFIED_CHINESE_NAME = "简体中文";

const capitalise = (text: string, tag: string) =>
  text.charAt(0).toLocaleUpperCase(tag) + text.slice(1);

/** The language's own name: "English", "Français", "繁體中文" (zh-HK), "简体中文" (zh-CN), "中文" (zh). */
const baseName = ({ tag, language }: OwnLocale): string => {
  const [code, ...subtags] = tag.toLowerCase().split("-");
  if (code === "zh" && subtags.length > 0) {
    return isTraditionalChinese(tag) ? TRADITIONAL_CHINESE_NAME : SIMPLIFIED_CHINESE_NAME;
  }
  return capitalise(language, tag);
};

/**
 * The name the language switcher shows for each language of a site, in that language, in the same
 * order. Two languages that would read the same (en_GB and en_US, zh_HK and zh_TW) get their
 * country: "English (United Kingdom)".
 */
export const languageNames = (locales: OwnLocale[]): string[] => {
  const names = locales.map((locale) => baseName(locale));
  return names.map((name, index) => {
    const shared = names.indexOf(name) !== names.lastIndexOf(name);
    const { country } = locales[index];
    return shared && country ? `${name} (${country})` : name;
  });
};
