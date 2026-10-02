import { describe, expect, it } from "vitest";
import { formatDate, formatPrice, isSaleOver, isoDay, periodKind, today } from "./format.js";

/** Intl separates code and amount with a no-break space (U+00A0, or U+202F in French). */
const spaces = (value?: string) => value?.replaceAll(/[\u00a0\u202f]/g, " ");

describe("formatPrice", () => {
  it("writes the currency code for the eye and its name for screen readers", () => {
    const price = formatPrice(1280, "HKD", "en");
    expect(spaces(price?.visual)).toBe("HKD 1,280");
    expect(spaces(price?.spoken)).toBe("1,280 Hong Kong dollars");
  });

  it("follows the page's language", () => {
    const price = formatPrice(1280, "EUR", "fr");
    expect(spaces(price?.visual)).toBe("1 280 EUR");
    expect(spaces(price?.spoken)).toBe("1 280 euros");
  });

  it("keeps the decimals of an amount that has some", () => {
    expect(spaces(formatPrice(99.5, "USD", "en")?.visual)).toBe("USD 99.50");
  });

  it("returns nothing for a missing amount, a negative one or an unknown currency", () => {
    expect(formatPrice(undefined, "HKD", "en")).toBeUndefined();
    expect(formatPrice(-1, "HKD", "en")).toBeUndefined();
    expect(formatPrice(Number.NaN, "HKD", "en")).toBeUndefined();
    expect(formatPrice(100, undefined, "en")).toBeUndefined();
    expect(formatPrice(100, "hkd", "en")).toBeUndefined();
    expect(formatPrice(100, "HKD<script>", "en")).toBeUndefined();
  });

  it("formats a zero price", () => {
    expect(spaces(formatPrice(0, "JPY", "en")?.visual)).toBe("JPY 0");
  });
});

describe("formatDate", () => {
  it("shows the calendar day picked by the editor, whatever the server time zone", () => {
    // Midnight in Paris is 22:00 UTC the day before: the visitor must still read the 30th.
    expect(formatDate("2026-11-30T00:00:00.000+01:00", "en")).toBe("November 30, 2026");
    expect(formatDate("2026-11-30T00:00:00.000+01:00", "fr")).toBe("30 novembre 2026");
  });

  it("has a shorter style for cards", () => {
    expect(formatDate("2026-11-30T00:00:00.000Z", "en", "medium")).toBe("Nov 30, 2026");
    expect(formatDate("2026-11-30T00:00:00.000Z", "fr", "medium")).toBe("30 nov. 2026");
  });

  it("returns undefined for no date or an invalid one", () => {
    expect(formatDate(undefined, "en")).toBeUndefined();
    expect(formatDate("not-a-date", "en")).toBeUndefined();
  });
});

describe("isoDay", () => {
  it("keeps the date part of an ISO string", () => {
    expect(isoDay("2026-11-30T00:00:00.000+01:00")).toBe("2026-11-30");
    expect(isoDay("2026-11")).toBeUndefined();
    expect(isoDay(undefined)).toBeUndefined();
  });
});

describe("isSaleOver", () => {
  it("runs the sale through its last day", () => {
    expect(isSaleOver("2026-10-01T00:00:00.000+02:00", "2026-10-01")).toBe(false);
    expect(isSaleOver("2026-09-30T00:00:00.000+02:00", "2026-10-01")).toBe(true);
    expect(isSaleOver("2026-10-02T00:00:00.000Z", "2026-10-01")).toBe(false);
  });

  it("never ends an offer without an end of sale", () => {
    expect(isSaleOver(undefined, "2026-10-01")).toBe(false);
    expect(isSaleOver("garbage", "2026-10-01")).toBe(false);
  });

  it("compares with today's UTC day", () => {
    expect(today(new Date("2026-10-01T23:30:00Z"))).toBe("2026-10-01");
  });
});

describe("periodKind", () => {
  it("names the sentence of a travel period", () => {
    expect(periodKind("2026-11-01", "2026-12-15")).toBe("range");
    expect(periodKind("2026-11-01", undefined)).toBe("from");
    expect(periodKind(undefined, "2026-12-15")).toBe("until");
    expect(periodKind(undefined, undefined)).toBe("none");
  });
});
