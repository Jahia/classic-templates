import { describe, expect, it } from "vitest";
import {
  dayIn,
  formatDate,
  formatTime,
  indexLetter,
  isoDay,
  isoInZone,
  readingMinutes,
  sortNameOf,
  validTimeZone,
} from "./format.js";

describe("calendar days", () => {
  it("keeps the day the editor picked, whatever the server's zone", () => {
    expect(isoDay("2027-06-08T00:00:00.000+02:00")).toBe("2027-06-08");
    expect(formatDate("2027-06-08T00:00:00.000+02:00", "en-GB")).toBe("8 June 2027");
    expect(formatDate("2027-06-08T00:00:00.000+02:00", "fr")).toBe("8 juin 2027");
    expect(formatDate("2027-06-08", "en-GB", "full")).toBe("Tuesday, 8 June 2027");
  });

  it("returns nothing without a date", () => {
    expect(isoDay(undefined)).toBeUndefined();
    expect(formatDate("not a date", "en")).toBeUndefined();
  });
});

describe("times in the event's zone", () => {
  const start = "2027-06-08T08:30:00.000Z";

  it("falls back to UTC for an unknown zone", () => {
    expect(validTimeZone("Europe/Lisbon")).toBe("Europe/Lisbon");
    expect(validTimeZone("Mars/Olympus")).toBe("UTC");
    expect(validTimeZone(undefined)).toBe("UTC");
  });

  it("gives the day and the time of the event's zone", () => {
    expect(dayIn(start, "Europe/Lisbon")).toBe("2027-06-08");
    expect(dayIn("2027-06-08T23:30:00.000Z", "Europe/Paris")).toBe("2027-06-09");
    expect(formatTime(start, "fr", "Europe/Lisbon")).toBe("09:30");
    expect(formatTime(start, "en-US", "Europe/Lisbon")).toBe("9:30 AM");
  });

  it("writes the instant with the zone's offset for <time>", () => {
    expect(isoInZone(start, "Europe/Lisbon")).toBe("2027-06-08T09:30:00+01:00");
    expect(isoInZone(start, "America/New_York")).toBe("2027-06-08T04:30:00-04:00");
    expect(isoInZone(start, "UTC")).toBe("2027-06-08T08:30:00+00:00");
    expect(isoInZone(undefined, "UTC")).toBeUndefined();
  });
});

describe("readingMinutes", () => {
  it("counts the words of the text, tags left out, at least one minute", () => {
    expect(readingMinutes(undefined)).toBe(1);
    expect(readingMinutes(`<p>${"word ".repeat(450)}</p>`)).toBe(3);
  });
});

describe("sort names and index letters", () => {
  it("files a person under the sort name, else the last word of the name", () => {
    expect(sortNameOf("Mara Lindqvist", undefined)).toBe("Lindqvist");
    expect(sortNameOf("Mara Lindqvist", "de Vries")).toBe("de Vries");
    expect(sortNameOf(undefined, undefined)).toBe("");
  });

  it("gives the letter without accent, and # for anything else", () => {
    expect(indexLetter("Éluard")).toBe("E");
    expect(indexLetter("de Vries")).toBe("D");
    expect(indexLetter("4K Labs")).toBe("#");
    expect(indexLetter("")).toBe("#");
  });
});
