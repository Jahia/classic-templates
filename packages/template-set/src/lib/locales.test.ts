import { describe, expect, it } from "vitest";
import en from "../../settings/locales/en.json";
import fr from "../../settings/locales/fr.json";
import ja from "../../settings/locales/ja.json";
import pt from "../../settings/locales/pt.json";
import zhFile from "../../settings/locales/zh.json";
import { TRADITIONAL_CHINESE } from "./labels.js";

type Tree = { [key: string]: string | Tree };

/** Dotted path of every string of a locale file, in file order. */
const flatten = (tree: Tree, prefix = ""): [string, string][] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [[`${prefix}${key}`, value]] : flatten(value, `${prefix}${key}.`),
  );

/** The {{placeholders}} of a value, sorted. */
const placeholders = (value: string) =>
  (value.match(/{{\s*\w+\s*}}/g) ?? []).sort((a, b) => a.localeCompare(b));

/**
 * zh.json holds two sets of labels: Simplified at its root and their Traditional copy under
 * "zh-Hant" (the engine reads one file per language, lib/labels.ts picks the set). Each is checked
 * against en.json, so a key added in Simplified and not in Traditional fails here.
 */
const { [TRADITIONAL_CHINESE]: zhHant, ...zh } = zhFile;

const reference = flatten(en);
const referenceKeys = reference.map(([key]) => key);

describe.each([
  ["fr", fr],
  ["pt", pt],
  ["ja", ja],
  ["zh", zh],
  ["zh.json zh-Hant", zhHant],
] as const)("%s against en.json", (_language, locale) => {
  const entries = flatten(locale);

  it("has exactly the keys of en.json, in the same order", () => {
    expect(entries.map(([key]) => key)).toEqual(referenceKeys);
  });

  it("has no empty value", () => {
    expect(entries.filter(([, value]) => value.trim() === "").map(([key]) => key)).toEqual([]);
  });

  it("keeps the placeholders of every value", () => {
    const byKey = new Map(entries);
    const broken = reference
      .filter(
        ([key, value]) => placeholders(byKey.get(key) ?? "").join() !== placeholders(value).join(),
      )
      .map(([key]) => key);
    expect(broken).toEqual([]);
  });
});

describe("zh.json, Simplified and Traditional", () => {
  const simplified = flatten(zh);
  const traditional = new Map(flatten(zhHant));

  it("has a Traditional copy of every Simplified key", () => {
    expect(simplified.map(([key]) => key).filter((key) => !traditional.has(key))).toEqual([]);
  });

  it("writes the two sets in their own script", () => {
    const byKey = new Map(simplified);
    expect(byKey.get("editorial.readingTime_other")).toBe("阅读时间 {{count}} 分钟");
    expect(traditional.get("editorial.readingTime_other")).toBe("閱讀時間 {{count}} 分鐘");
  });
});
