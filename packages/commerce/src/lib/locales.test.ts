import { describe, expect, it } from "vitest";
import ar from "../../settings/locales/ar.json";
import en from "../../settings/locales/en.json";
import fr from "../../settings/locales/fr.json";

type Tree = { [key: string]: string | Tree };

/** Dotted path of every string of a locale file, in file order. */
const flatten = (tree: Tree, prefix = ""): [string, string][] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [[`${prefix}${key}`, value]] : flatten(value, `${prefix}${key}.`),
  );

const placeholders = (value: string) =>
  (value.match(/{{\s*\w+\s*}}/g) ?? []).sort((a, b) => a.localeCompare(b));

const reference = flatten(en);

describe.each([
  ["fr", fr],
  ["ar", ar],
] as const)("%s.json against en.json", (_language, locale) => {
  const entries = flatten(locale);

  it("has exactly the keys of en.json, in the same order", () => {
    expect(entries.map(([key]) => key)).toEqual(reference.map(([key]) => key));
  });

  it("has no empty value and keeps every placeholder", () => {
    const byKey = new Map(entries);
    expect(entries.filter(([, value]) => value.trim() === "").map(([key]) => key)).toEqual([]);
    expect(
      reference
        .filter(
          ([key, value]) =>
            placeholders(byKey.get(key) ?? "").join() !== placeholders(value).join(),
        )
        .map(([key]) => key),
    ).toEqual([]);
  });
});
