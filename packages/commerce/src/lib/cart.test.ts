import { describe, expect, it } from "vitest";
import {
  MAX_QUANTITY,
  addItem,
  checkoutLinks,
  itemCount,
  parseCart,
  setQuantity,
  subtotals,
  validEntry,
  variantNumber,
  type CartEntry,
} from "./cart.js";

const entry = (variant: string, price = 95, store = "https://demo.myshopify.com"): CartEntry => ({
  variant,
  product: "uuid-1",
  title: "Silk Lipstick",
  option: "",
  price,
  currency: "AED",
  url: "/sites/demo/contents/p.html",
  image: "https://cdn.shopify.com/a.jpg",
  store,
  tags: ["makeup"],
});

describe("variantNumber", () => {
  it("reads the number of a Shopify variant id", () => {
    expect(variantNumber("gid://shopify/ProductVariant/57672824062024")).toBe("57672824062024");
  });
  it("refuses anything but digits", () => {
    for (const bad of [undefined, "", "gid://shopify/ProductVariant/", "gid://x/12a", "12:3"]) {
      expect(variantNumber(bad)).toBeUndefined();
    }
  });
});

describe("validEntry", () => {
  it("keeps a well-formed entry", () => {
    expect(validEntry(entry("1"))).toEqual(entry("1"));
  });
  it("drops an entry whose store, link, image or price could be abused", () => {
    expect(validEntry({ ...entry("1"), store: "javascript:alert(1)" })).toBeUndefined();
    expect(validEntry({ ...entry("1"), store: "https://shop.example/cart?x" })).toBeUndefined();
    expect(validEntry({ ...entry("1"), url: "//evil.example/p" })).toBeUndefined();
    expect(validEntry({ ...entry("1"), image: "http://cdn.example/a.jpg" })).toBeUndefined();
    expect(validEntry({ ...entry("1"), price: -1 })).toBeUndefined();
    expect(validEntry({ ...entry("1"), currency: "aed" })).toBeUndefined();
    expect(validEntry({ ...entry("1"), variant: "1,2" })).toBeUndefined();
    expect(validEntry(null)).toBeUndefined();
  });
});

describe("the bag", () => {
  it("adds a line, then one more of the same variant", () => {
    const once = addItem([], entry("1"));
    const twice = addItem(once, entry("1"));
    expect(twice).toHaveLength(1);
    expect(twice[0].quantity).toBe(2);
    expect(itemCount(addItem(twice, entry("2")))).toBe(3);
  });
  it("caps a line and removes it at 0", () => {
    const cart = addItem([], entry("1"));
    expect(setQuantity(cart, "1", 99)[0].quantity).toBe(MAX_QUANTITY);
    expect(setQuantity(cart, "1", 0)).toEqual([]);
  });
  it("totals per currency without floating-point noise", () => {
    const cart = setQuantity(addItem(addItem([], entry("1", 0.1)), entry("2", 0.2)), "1", 3);
    expect(subtotals(cart)).toEqual([{ currency: "AED", amount: 0.5 }]);
  });
  it("reads only valid lines back from storage", () => {
    const stored = JSON.stringify([
      { ...entry("1"), quantity: 2 },
      { ...entry("x"), quantity: 1 },
      { ...entry("3"), quantity: 0 },
    ]);
    expect(parseCart(stored).map((i) => [i.variant, i.quantity])).toEqual([["1", 2]]);
    expect(parseCart("not json")).toEqual([]);
    expect(parseCart(null)).toEqual([]);
  });
});

describe("checkoutLinks", () => {
  it("builds one Shopify cart permalink per shop", () => {
    let cart = addItem(addItem([], entry("1")), entry("2"));
    cart = setQuantity(cart, "2", 3);
    cart = addItem(cart, entry("9", 10, "https://other.myshopify.com"));
    expect(checkoutLinks(cart)).toEqual([
      { store: "https://demo.myshopify.com", url: "https://demo.myshopify.com/cart/1:1,2:3" },
      { store: "https://other.myshopify.com", url: "https://other.myshopify.com/cart/9:1" },
    ]);
  });
});
