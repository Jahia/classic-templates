import { describe, expect, it } from "vitest";
import en from "../../settings/locales/en.json";
import fr from "../../settings/locales/fr.json";
import pt from "../../settings/locales/pt.json";

type Tree = { [key: string]: string | Tree };

/** Dotted path of every string of a locale file, in file order. */
const flatten = (tree: Tree, prefix = ""): [string, string][] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [[`${prefix}${key}`, value]] : flatten(value, `${prefix}${key}.`),
  );

/** The {{placeholders}} of a value, sorted. */
const placeholders = (value: string) =>
  (value.match(/{{\s*\w+\s*}}/g) ?? []).sort((a, b) => a.localeCompare(b));

const reference = flatten(en);
const referenceKeys = reference.map(([key]) => key);

describe.each([
  ["fr", fr],
  ["pt", pt],
] as const)("%s.json against en.json", (_language, locale) => {
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
