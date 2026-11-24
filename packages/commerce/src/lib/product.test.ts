import { describe, expect, it } from "vitest";
import { displayPrice, hasTag, maxProducts, productImageUrl } from "./product.js";

describe("displayPrice", () => {
  it("shows the lowest price, marked from when the variants differ", () => {
    expect(displayPrice([120, 95, 150])).toEqual({ amount: 95, from: true });
    expect(displayPrice([80, 80])).toEqual({ amount: 80, from: false });
    expect(displayPrice(["45.5"])).toEqual({ amount: 45.5, from: false });
  });

  it("is undefined without a valid price", () => {
    expect(displayPrice(undefined)).toBeUndefined();
    expect(displayPrice([])).toBeUndefined();
    expect(displayPrice([-1, Number.NaN, "abc"])).toBeUndefined();
  });
});

describe("productImageUrl", () => {
  it("keeps https addresses and paths on this site only", () => {
    expect(productImageUrl("/files/live/sites/demo/files/a.jpg")).toBe(
      "/files/live/sites/demo/files/a.jpg",
    );
    expect(productImageUrl("//evil.example/a.jpg")).toBeUndefined();
    expect(productImageUrl(String.raw`/\evil.example/a.jpg`)).toBeUndefined();
    expect(productImageUrl(" https://cdn.shopify.com/a.jpg ")).toBe(
      "https://cdn.shopify.com/a.jpg",
    );
    expect(productImageUrl("http://cdn.shopify.com/a.jpg")).toBeUndefined();
    expect(productImageUrl("javascript:alert(1)")).toBeUndefined();
    expect(productImageUrl(undefined)).toBeUndefined();
  });
});

describe("hasTag", () => {
  it("matches a tag whatever its case, and keeps everything without a tag", () => {
    expect(hasTag(["Bestseller", "new"], "bestseller")).toBe(true);
    expect(hasTag(["new"], " NEW ")).toBe(true);
    expect(hasTag(["new"], "bestseller")).toBe(false);
    expect(hasTag(undefined, "new")).toBe(false);
    expect(hasTag(["new"], "")).toBe(true);
    expect(hasTag(undefined, undefined)).toBe(true);
  });
});

describe("maxProducts", () => {
  it("keeps the editor's value within 1 to 24, else 8", () => {
    expect(maxProducts(4)).toBe(4);
    expect(maxProducts(40)).toBe(24);
    expect(maxProducts(0)).toBe(8);
    expect(maxProducts(undefined)).toBe(8);
  });
});
