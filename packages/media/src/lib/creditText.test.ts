import { describe, expect, it } from "vitest";
import { CREDIT_PROPERTY, MAX_CREDIT_LENGTH, normalizeCredit } from "./creditText.js";

describe("normalizeCredit", () => {
  it("returns nothing for a missing, empty or blank credit", () => {
    expect(normalizeCredit(undefined)).toBeUndefined();
    expect(normalizeCredit(null)).toBeUndefined();
    expect(normalizeCredit("")).toBeUndefined();
    expect(normalizeCredit(" \n\t ")).toBeUndefined();
  });

  it("keeps the credit exactly as written, apart from its white space", () => {
    expect(normalizeCredit("Sofia Marques / Northlight Pictures")).toBe(
      "Sofia Marques / Northlight Pictures",
    );
    expect(normalizeCredit("  Mara Lindqvist \n /  Studio Nord ")).toBe(
      "Mara Lindqvist / Studio Nord",
    );
  });

  it("cuts a very long value", () => {
    const credit = normalizeCredit("a".repeat(MAX_CREDIT_LENGTH + 50));
    expect(credit).toHaveLength(MAX_CREDIT_LENGTH);
  });

  it("does not leave a trailing space where it cuts", () => {
    const credit = normalizeCredit(`${"a".repeat(MAX_CREDIT_LENGTH - 1)} bbbb`);
    expect(credit).toBe("a".repeat(MAX_CREDIT_LENGTH - 1));
  });
});

describe("CREDIT_PROPERTY", () => {
  it("is the property the mixin declares", () => {
    expect(CREDIT_PROPERTY).toBe("ctmdCredit");
  });
});
