import { describe, expect, it } from "vitest";
import { absolute, buildDestinationLd, buildFareLd, jsonForScript, originOf } from "./schema.js";

const URL = "https://www.example.com/sites/skylantern/contents/destinations/tokyo.html";

describe("buildDestinationLd", () => {
  it("describes the destination and points at the page's WebPage", () => {
    const ld = buildDestinationLd({
      url: URL,
      name: "Tokyo",
      description: "Neon, temples and ramen.",
      country: "Japan",
      price: 2980,
      currency: "HKD",
    });
    expect(ld).toEqual({
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      "@id": `${URL}#destination`,
      "name": "Tokyo",
      "description": "Neon, temples and ramen.",
      "url": URL,
      "containedInPlace": { "@type": "Country", "name": "Japan" },
      "mainEntityOfPage": { "@id": URL },
      "offers": { "@type": "Offer", "price": 2980, "priceCurrency": "HKD" },
    });
  });

  it("leaves out what the page does not show", () => {
    const ld = buildDestinationLd({ url: URL, name: "Tokyo" });
    expect(Object.keys(ld)).not.toContain("offers");
    expect(Object.keys(ld)).not.toContain("containedInPlace");
    expect(Object.keys(ld)).not.toContain("image");
  });
});

describe("buildFareLd", () => {
  it("describes the offer, its route and its destination", () => {
    const ld = buildFareLd({
      url: `${URL}x`,
      name: "Tokyo in Economy",
      price: 2980,
      currency: "HKD",
      validThrough: "2026-10-31",
      cabin: "Economy",
      route: "Hong Kong to Tokyo",
      destinationUrl: URL,
      destinationName: "Tokyo",
    });
    expect(ld).toMatchObject({
      "@type": "Offer",
      "price": 2980,
      "priceCurrency": "HKD",
      "priceValidUntil": "2026-10-31",
      "category": "Economy",
      "itemOffered": {
        "@type": "Trip",
        "name": "Hong Kong to Tokyo",
        "itinerary": { "@id": `${URL}#destination`, "name": "Tokyo" },
      },
      "mainEntityOfPage": { "@id": `${URL}x` },
    });
  });

  it("writes no currency without a price", () => {
    const ld = buildFareLd({ url: URL, name: "x", currency: "HKD" });
    expect(ld).not.toHaveProperty("priceCurrency");
    expect(ld).not.toHaveProperty("itemOffered");
  });
});

describe("jsonForScript", () => {
  it("never lets a value close the script element", () => {
    const out = jsonForScript({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>" });
  });

  it("escapes the JavaScript line separators", () => {
    expect(jsonForScript("a\u2028b\u2029c")).toBe(String.raw`"a\u2028b\u2029c"`);
  });
});

describe("absolute URLs", () => {
  it("leaves out the default port", () => {
    expect(originOf("https", "www.example.com", 443)).toBe("https://www.example.com");
    expect(originOf("https", "localhost", 8443)).toBe("https://localhost:8443");
    expect(originOf("https", "localhost", -1)).toBe("https://localhost");
  });

  it("prefixes relative URLs only", () => {
    expect(absolute("https://h", "/a.html")).toBe("https://h/a.html");
    expect(absolute("https://h", "https://cdn/x.jpg")).toBe("https://cdn/x.jpg");
  });
});
