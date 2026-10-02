import { describe, expect, it } from "vitest";
import { chooseItemLabel, itemLabelMode } from "./itemLabel.js";

describe("itemLabelMode", () => {
  it("keeps the allowed values", () => {
    expect(itemLabelMode("type")).toBe("type");
    expect(itemLabelMode("category")).toBe("category");
    expect(itemLabelMode("none")).toBe("none");
  });

  it("falls back for a missing or unknown value: type for lists, or the given fallback", () => {
    expect(itemLabelMode(undefined)).toBe("type");
    expect(itemLabelMode(null)).toBe("type");
    expect(itemLabelMode("tags")).toBe("type");
    expect(itemLabelMode(42)).toBe("type");
    expect(itemLabelMode(undefined, "none")).toBe("none");
    expect(itemLabelMode("Category", "none")).toBe("none");
  });
});

describe("chooseItemLabel", () => {
  it("shows the type by default, whatever the categories", () => {
    expect(chooseItemLabel("type", "News", ["Press release"])).toBe("News");
  });

  it("shows the first category title in category mode", () => {
    expect(chooseItemLabel("category", "News", ["Travel advisory", "Weather"])).toBe(
      "Travel advisory",
    );
  });

  it("skips blank category titles and falls back to the type without a titled category", () => {
    expect(chooseItemLabel("category", "News", ["  ", "Weather"])).toBe("Weather");
    expect(chooseItemLabel("category", "News", [])).toBe("News");
    expect(chooseItemLabel("category", "News", [""])).toBe("News");
  });

  it("shows nothing in none mode", () => {
    expect(chooseItemLabel("none", "News", ["Weather"])).toBeUndefined();
  });
});
