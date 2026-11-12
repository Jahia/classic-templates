import i18next from "i18next";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import en from "../../settings/locales/en.json";
import zh from "../../settings/locales/zh.json";
import { isTraditionalChinese, useLabels } from "./labels.js";

// As the engine does: one bundle per language, the region ignored ("zh" for zh_HK and zh_CN).
await i18next.init({
  lng: "zh",
  fallbackLng: "en",
  ns: ["classic-templates"],
  defaultNS: "classic-templates",
  resources: { en: { "classic-templates": en }, zh: { "classic-templates": zh } },
  react: { useSuspense: false },
});

const ReadingTime = ({ locale }: { locale: string }) => {
  const { t } = useLabels(locale);
  return (
    <p>
      {t("editorial.readingTime", { count: 1 })} | {t("nav.submenu", { title: "A" })}
    </p>
  );
};

const render = (locale: string) =>
  renderToStaticMarkup(
    <I18nextProvider i18n={i18next}>
      <ReadingTime locale={locale} />
    </I18nextProvider>,
  );

describe("isTraditionalChinese", () => {
  it.each(["zh_HK", "zh_TW", "zh_MO", "zh-HK", "zh-Hant", "zh-Hant-HK", "zh_Hant_CN", "ZH-tw"])(
    "%s is Traditional",
    (locale) => expect(isTraditionalChinese(locale)).toBe(true),
  );

  it.each(["zh", "zh_CN", "zh-SG", "zh-Hans", "zh-Hans-HK", "en", "en_HK", "ja", "fr_CA", ""])(
    "%s is not",
    (locale) => expect(isTraditionalChinese(locale)).toBe(false),
  );
});

describe("useLabels", () => {
  it.each(["zh_HK", "zh_TW", "zh_MO"])("gives the Traditional labels on a %s page", (locale) => {
    expect(render(locale)).toBe("<p>閱讀時間 1 分鐘 | 顯示「A」子選單</p>");
  });

  it.each(["zh_CN", "zh"])("keeps the Simplified labels on a %s page", (locale) => {
    expect(render(locale)).toBe("<p>阅读时间 1 分钟 | 显示“A”子菜单</p>");
  });

  it("leaves other languages alone", async () => {
    await i18next.changeLanguage("en");
    expect(render("en_HK")).toBe("<p>1 min read | Show the A submenu</p>");
    await i18next.changeLanguage("zh");
  });
});
