import { describe, expect, it } from "vitest";
import {
  type FareEntry,
  fareSort,
  maxItems,
  regionFilter,
  selectDestinations,
  selectFares,
} from "./select.js";

const compare = new Intl.Collator("en").compare;
const DAY = "2026-10-01";

const fares: FareEntry[] = [
  {
    id: "tokyo-y",
    price: 2980,
    saleEnds: "2026-10-31",
    destinationTitle: "Tokyo",
    region: "japanKorea",
  },
  {
    id: "osaka",
    price: 1980,
    saleEnds: "2026-10-15",
    destinationTitle: "Osaka",
    region: "japanKorea",
  },
  {
    id: "bangkok",
    price: 1280,
    saleEnds: "2026-11-30",
    destinationTitle: "Bangkok",
    region: "southeastAsia",
  },
  {
    id: "ended",
    price: 500,
    saleEnds: "2026-09-30",
    destinationTitle: "Taipei",
    region: "greaterChina",
  },
  { id: "noprice", destinationTitle: "Auckland", region: "oceania" },
  { id: "tokyo-j", price: 9800, destinationTitle: "Tokyo", region: "japanKorea" },
];

const ids = (items: { id: string }[]) => items.map((item) => item.id);

describe("selectFares", () => {
  it("sorts by price, cheapest first, offers without a price last", () => {
    const { items, ended } = selectFares(fares, {
      region: "all",
      sort: "priceAsc",
      max: 10,
      day: DAY,
      compare,
    });
    expect(ids(items)).toEqual(["bangkok", "osaka", "tokyo-y", "tokyo-j", "noprice"]);
    expect(ended).toBe(1);
  });

  it("sorts by end of sale, soonest first, open-ended offers last", () => {
    const { items } = selectFares(fares, {
      region: "all",
      sort: "saleEndsAsc",
      max: 10,
      day: DAY,
      compare,
    });
    expect(ids(items)).toEqual(["osaka", "tokyo-y", "bangkok", "tokyo-j", "noprice"]);
  });

  it("sorts by destination name, then by price", () => {
    const { items } = selectFares(fares, {
      region: "all",
      sort: "destinationAsc",
      max: 10,
      day: DAY,
      compare,
    });
    expect(ids(items)).toEqual(["noprice", "bangkok", "osaka", "tokyo-y", "tokyo-j"]);
  });

  it("keeps only the chosen region and counts the others", () => {
    const result = selectFares(fares, {
      region: "japanKorea",
      sort: "priceAsc",
      max: 10,
      day: DAY,
      compare,
    });
    expect(ids(result.items)).toEqual(["osaka", "tokyo-y", "tokyo-j"]);
    expect(result.otherRegion).toBe(3);
  });

  it("keeps ended offers when asked (edit mode) and limits the count", () => {
    const { items } = selectFares(fares, {
      region: "all",
      sort: "priceAsc",
      max: 2,
      day: DAY,
      compare,
      keepEnded: true,
    });
    expect(ids(items)).toEqual(["ended", "bangkok"]);
  });

  it("keeps an offer on its last day of sale", () => {
    const { items } = selectFares(fares, {
      region: "all",
      sort: "priceAsc",
      max: 10,
      day: "2026-09-30",
      compare,
    });
    expect(ids(items)).toContain("ended");
  });
});

describe("selectDestinations", () => {
  const destinations = [
    { id: "z", title: "Zhengzhou", region: "greaterChina" },
    { id: "a", title: "Ōsaka", region: "japanKorea" },
    { id: "b", title: "Bangkok", region: "southeastAsia" },
    { id: "u" },
  ];

  it("sorts A to Z in the page's language, untitled last", () => {
    expect(ids(selectDestinations(destinations, { region: "all", max: 10, compare }))).toEqual([
      "b",
      "a",
      "z",
      "u",
    ]);
  });

  it("filters by region and limits the count", () => {
    expect(
      ids(selectDestinations(destinations, { region: "japanKorea", max: 10, compare })),
    ).toEqual(["a"]);
    expect(ids(selectDestinations(destinations, { region: "all", max: 1, compare }))).toEqual([
      "b",
    ]);
  });
});

describe("option guards", () => {
  it("reads unknown values as the defaults", () => {
    expect(regionFilter("europe")).toBe("europe");
    expect(regionFilter("mars")).toBe("all");
    expect(regionFilter(undefined)).toBe("all");
    expect(fareSort("saleEndsAsc")).toBe("saleEndsAsc");
    expect(fareSort("random")).toBe("priceAsc");
  });

  it("bounds the number of items between 1 and 50", () => {
    expect(maxItems(undefined)).toBe(6);
    expect(maxItems(0)).toBe(6);
    expect(maxItems(-4)).toBe(6);
    expect(maxItems(3.7)).toBe(3);
    expect(maxItems(500)).toBe(50);
    expect(maxItems("12")).toBe(12);
  });
});
