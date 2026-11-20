import { describe, expect, it } from "vitest";
import { languageNames } from "./languageName.js";

const english = { tag: "en", language: "English", country: "" };
const hongKong = { tag: "zh-HK", language: "中文", country: "中國香港特別行政區" };
const mainland = { tag: "zh-CN", language: "中文", country: "中国" };

describe("languageNames", () => {
  it("names each language in itself, Chinese by its script", () => {
    expect(languageNames([english, hongKong, mainland])).toEqual([
      "English",
      "繁體中文",
      "简体中文",
    ]);
  });

  it("capitalises names Java gives in lower case", () => {
    expect(
      languageNames([
        { tag: "fr", language: "français", country: "" },
        { tag: "pt-BR", language: "português", country: "Brasil" },
      ]),
    ).toEqual(["Français", "Português"]);
  });

  it("reads the script from the tag before the region", () => {
    expect(
      languageNames([
        { tag: "zh-Hant", language: "中文", country: "" },
        { tag: "zh-Hans-HK", language: "中文", country: "中国香港特别行政区" },
      ]),
    ).toEqual(["繁體中文", "简体中文"]);
  });

  it("tells two Traditional Chinese regions apart", () => {
    expect(
      languageNames([hongKong, { tag: "zh-TW", language: "中文", country: "台灣" }, mainland]),
    ).toEqual(["繁體中文 (中國香港特別行政區)", "繁體中文 (台灣)", "简体中文"]);
  });

  it("keeps the plain name of a Chinese site that names neither script nor region", () => {
    expect(languageNames([english, { tag: "zh", language: "中文", country: "" }])).toEqual([
      "English",
      "中文",
    ]);
  });

  it("adds the country to languages that would read the same", () => {
    expect(
      languageNames([
        { tag: "en-GB", language: "English", country: "United Kingdom" },
        { tag: "en-US", language: "English", country: "United States" },
        { tag: "fr", language: "français", country: "" },
      ]),
    ).toEqual(["English (United Kingdom)", "English (United States)", "Français"]);
  });
});
