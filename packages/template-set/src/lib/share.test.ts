import { describe, expect, it } from "vitest";
import { absoluteUrl } from "./absolute.js";
import { firstShareImage, fullTitle, ogLocale } from "./share.js";

describe("firstShareImage", () => {
  it("returns the first candidate that resolves, with its source", () => {
    const calls: string[] = [];
    const track = (name: string, value: string | undefined) => () => {
      calls.push(name);
      return value;
    };
    const found = firstShareImage([
      { source: "seo", find: track("seo", undefined) },
      { source: "item", find: track("item", "item.jpg") },
      { source: "logo", find: track("logo", "logo.png") },
    ]);
    expect(found).toEqual({ image: "item.jpg", source: "item" });
    expect(calls).toEqual(["seo", "item"]);
  });

  it("returns undefined when nothing resolves", () => {
    expect(firstShareImage([{ source: "logo", find: () => undefined }])).toBeUndefined();
  });
});

describe("ogLocale", () => {
  it("writes the territory with an underscore", () => {
    expect(ogLocale("fr-FR")).toBe("fr_FR");
    expect(ogLocale("en")).toBe("en");
  });
});

describe("fullTitle", () => {
  it("joins page and site, and keeps the site name alone on home", () => {
    expect(fullTitle("About us", "Classic Dev")).toBe("About us | Classic Dev");
    expect(fullTitle("Classic Dev", "Classic Dev")).toBe("Classic Dev");
    expect(fullTitle(undefined, "Classic Dev")).toBe("Classic Dev");
  });
});

describe("absoluteUrl", () => {
  it("prefixes site paths with the origin and keeps full URLs", () => {
    expect(absoluteUrl("https://example.org", "/files/live/a.jpg")).toBe(
      "https://example.org/files/live/a.jpg",
    );
    expect(absoluteUrl("https://example.org", "https://cdn.example.org/a.jpg")).toBe(
      "https://cdn.example.org/a.jpg",
    );
  });
});
