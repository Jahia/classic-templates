import { describe, expect, it } from "vitest";
import { NOTICE_DEFAULT_ITEMS, noticeItemCount, noticeSignature } from "./notice.js";

describe("noticeItemCount", () => {
  it("defaults to 3 when the value is missing or not a number", () => {
    for (const value of [undefined, null, "", "three", Number.NaN, 0]) {
      expect(noticeItemCount(value)).toBe(NOTICE_DEFAULT_ITEMS);
    }
  });

  it("keeps the value within 1 to 10, rounded", () => {
    expect(noticeItemCount(-4)).toBe(1);
    expect(noticeItemCount(1)).toBe(1);
    expect(noticeItemCount("5")).toBe(5);
    expect(noticeItemCount(4.6)).toBe(5);
    expect(noticeItemCount(10)).toBe(10);
    expect(noticeItemCount(500)).toBe(10);
  });
});

describe("noticeSignature", () => {
  const a = "0c14bd3c-68bc-4109-80f5-9b2f8d6ee82e";
  const b = "6f1e2a90-1d0b-4c38-9f6e-2b8f1c3d4e5f";

  it("is stable for the same items", () => {
    expect(noticeSignature([a, b])).toBe(noticeSignature([a, b]));
  });

  it("changes when an item is added, removed or moved", () => {
    const base = noticeSignature([a, b]);
    expect(noticeSignature([a])).not.toBe(base);
    expect(noticeSignature([a, b, a])).not.toBe(base);
    expect(noticeSignature([b, a])).not.toBe(base);
  });

  it("only uses characters that are safe in an attribute and a storage value", () => {
    expect(noticeSignature([a, b])).toMatch(/^[0-9a-z]+$/);
    expect(noticeSignature([])).toMatch(/^[0-9a-z]+$/);
  });
});
