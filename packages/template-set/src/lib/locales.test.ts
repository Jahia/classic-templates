import { describe, expect, it } from "vitest";
import ar from "../../settings/locales/ar.json";
import en from "../../settings/locales/en.json";
import fr from "../../settings/locales/fr.json";
import ja from "../../settings/locales/ja.json";
import pt from "../../settings/locales/pt.json";
import zh from "../../settings/locales/zh.json";

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
 * CLDR plural forms English does not have (Arabic uses all six): a locale adds them next to the
 * `_one` / `_other` pair of en.json. The test compares a locale without them, and a form for zero,
 * one or two may spell its number out instead of using {{count}}.
 */
const EXTRA_PLURAL = /_(zero|two|few|many)$/;
const SPELLED_PLURAL = /_(zero|one|two)$/;

const reference = flatten(en);
const referenceKeys = reference.map(([key]) => key);

describe.each([
  ["fr", fr],
  ["pt", pt],
  ["ja", ja],
  ["zh", zh],
  ["ar", ar],
] as const)("%s.json against en.json", (language, locale) => {
  const all = flatten(locale);
  const entries = all.filter(([key]) => !EXTRA_PLURAL.test(key));
  const pluralRules = new Intl.PluralRules(language);

  it("has exactly the keys of en.json, in the same order", () => {
    expect(entries.map(([key]) => key)).toEqual(referenceKeys);
  });

  it("has no empty value", () => {
    expect(all.filter(([, value]) => value.trim() === "").map(([key]) => key)).toEqual([]);
  });

  it("keeps the placeholders of every value", () => {
    const byKey = new Map(entries);
    const broken = reference
      .filter(
        ([key]) =>
          !(pluralRules.resolvedOptions().pluralCategories.length > 2 && SPELLED_PLURAL.test(key)),
      )
      .filter(
        ([key, value]) => placeholders(byKey.get(key) ?? "").join() !== placeholders(value).join(),
      )
      .map(([key]) => key);
    expect(broken).toEqual([]);
  });

  // French, Portuguese... have a "many" form too (millions), which en.json's pair covers well
  // enough: only a locale that adds plural forms must add every one its language has.
  it.runIf(flatten(locale).some(([key]) => EXTRA_PLURAL.test(key)))(
    "has every plural form its language needs, and no other",
    () => {
      const categories = pluralRules.resolvedOptions().pluralCategories;
      const extra = all
        .map(([key]) => key.match(EXTRA_PLURAL)?.[1])
        .filter((form): form is string => form !== undefined);
      expect(extra.every((form) => (categories as string[]).includes(form))).toBe(true);
      const bases = reference
        .filter(([key]) => key.endsWith("_other"))
        .map(([key]) => key.slice(0, -6));
      const keys = new Set(all.map(([key]) => key));
      const missing = bases.flatMap((base) =>
        categories
          .filter((form) => form !== "one" && !keys.has(`${base}_${form}`))
          .map((form) => `${base}_${form}`),
      );
      expect(missing).toEqual([]);
    },
  );
});
