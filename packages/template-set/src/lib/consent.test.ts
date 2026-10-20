import { describe, expect, it } from "vitest";
import { CONSENT_DEFAULT_DAYS, consentDays } from "./consent.js";

describe("consentDays", () => {
  it("keeps a value within the range", () => {
    expect(consentDays(30)).toBe(30);
    expect(consentDays(395)).toBe(395);
  });
  it("rounds and clamps", () => {
    expect(consentDays(12.6)).toBe(13);
    expect(consentDays(-4)).toBe(1);
    expect(consentDays(1000)).toBe(395);
  });
  it("falls back to the default when missing or not a number", () => {
    expect(consentDays(undefined)).toBe(CONSENT_DEFAULT_DAYS);
    expect(consentDays("abc")).toBe(CONSENT_DEFAULT_DAYS);
    expect(consentDays(0)).toBe(CONSENT_DEFAULT_DAYS);
  });
});
