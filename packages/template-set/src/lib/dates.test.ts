import { describe, expect, it } from "vitest";
import { formatDate, isoDay } from "./dates.js";

describe("formatDate", () => {
  it("shows the calendar day picked by the editor, whatever the server time zone", () => {
    // Midnight in Paris is 22:00 UTC the day before: the visitor must still read the 30th.
    expect(formatDate("2026-09-30T00:00:00.000+02:00", "en")).toBe("September 30, 2026");
    expect(isoDay("2026-09-30T00:00:00.000+02:00")).toBe("2026-09-30");
  });

  it("formats in the page's language", () => {
    expect(formatDate("2026-09-28T09:00:00.000+02:00", "fr")).toBe("28 septembre 2026");
  });

  it("returns undefined for no date and the raw day for an invalid one", () => {
    expect(formatDate(undefined, "en")).toBeUndefined();
    expect(formatDate("not-a-date-at-all", "en")).toBe("not-a-date");
  });
});
