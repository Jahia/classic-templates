import { describe, expect, it } from "vitest";
import {
  BRIEF_STATUSES,
  LICENCES,
  MEDIA_WANTED,
  SUBMISSION_STATUSES,
  STATUS_CUE,
  USAGES,
  briefStatusOf,
  filterBriefs,
  isSubmissionStatus,
  knownValue,
  knownValues,
  listLimit,
  sortBriefs,
  sortSubmissions,
  submissionStatusOf,
} from "./briefs.js";

const brief = (title: string, deadline?: string, status?: string) => ({ title, deadline, status });

describe("briefStatusOf", () => {
  it("is closed only for 'closed'; anything else, a missing value included, is open", () => {
    expect(briefStatusOf("closed")).toBe("closed");
    expect(briefStatusOf("open")).toBe("open");
    expect(briefStatusOf(undefined)).toBe("open");
    expect(briefStatusOf("archived")).toBe("open");
  });
});

describe("filterBriefs", () => {
  const rows = [
    brief("a", "2026-11-01", "open"),
    brief("b", "2026-10-01", "closed"),
    brief("c", "2026-12-01"),
  ];

  it("keeps the open briefs (a missing status counts as open) unless closed ones are asked for", () => {
    expect(filterBriefs(rows, false).map((r) => r.title)).toEqual(["a", "c"]);
  });

  it("keeps every brief with showClosed, without touching the input", () => {
    const kept = filterBriefs(rows, true);
    expect(kept.map((r) => r.title)).toEqual(["a", "b", "c"]);
    expect(kept).not.toBe(rows);
  });
});

describe("sortBriefs", () => {
  it("orders by deadline, the nearest first", () => {
    const sorted = sortBriefs([
      brief("late", "2027-01-15T00:00:00.000Z"),
      brief("soon", "2026-11-02T00:00:00.000Z"),
      brief("mid", "2026-12-24T10:00:00.000+01:00"),
    ]);
    expect(sorted.map((r) => r.title)).toEqual(["soon", "mid", "late"]);
  });

  it("puts a brief without a deadline (or with an unreadable one) last", () => {
    const sorted = sortBriefs([brief("none"), brief("dated", "2026-11-02"), brief("bad", "soon")]);
    expect(sorted.map((r) => r.title)).toEqual(["dated", "bad", "none"]);
  });

  it("breaks a tie on the same day by title in the page language, accents and case aside", () => {
    const sorted = sortBriefs(
      [brief("Zèbre", "2026-11-02"), brief("éclair", "2026-11-02"), brief("Aube", "2026-11-02")],
      "fr",
    );
    expect(sorted.map((r) => r.title)).toEqual(["Aube", "éclair", "Zèbre"]);
  });

  it("does not change its input", () => {
    const rows = [brief("b", "2026-12-01"), brief("a", "2026-11-01")];
    sortBriefs(rows);
    expect(rows.map((r) => r.title)).toEqual(["b", "a"]);
  });
});

describe("sortSubmissions", () => {
  it("orders newest first, from the creation instant", () => {
    const sorted = sortSubmissions([
      { id: "old", created: "2026-10-01T09:00:00.000Z" },
      { id: "new", created: "2026-10-03T08:00:00.000+02:00" },
      { id: "mid", created: "2026-10-02T23:59:00.000Z" },
    ]);
    expect(sorted.map((r) => r.id)).toEqual(["new", "mid", "old"]);
  });

  it("puts a submission without a date last and keeps the order of equals", () => {
    const sorted = sortSubmissions([
      { id: "x" },
      { id: "a", created: "2026-10-01T00:00:00.000Z" },
      { id: "y", created: "garbage" },
      { id: "b", created: "2026-10-01T00:00:00.000Z" },
    ]);
    expect(sorted.map((r) => r.id)).toEqual(["a", "b", "x", "y"]);
  });
});

describe("submissionStatusOf", () => {
  it("maps each known status to itself", () => {
    for (const status of SUBMISSION_STATUSES) expect(submissionStatusOf(status)).toBe(status);
  });

  it("counts a missing or unknown value as just submitted", () => {
    expect(submissionStatusOf(undefined)).toBe("submitted");
    expect(submissionStatusOf("published")).toBe("submitted");
  });

  it("has a mark, different for each status, so that colour is never the only cue", () => {
    const marks = SUBMISSION_STATUSES.map((status) => STATUS_CUE[status]);
    expect(marks.every((mark) => mark.length > 0)).toBe(true);
    expect(new Set(marks).size).toBe(SUBMISSION_STATUSES.length);
  });

  it("recognises a status", () => {
    expect(isSubmissionStatus("inReview")).toBe(true);
    expect(isSubmissionStatus("in review")).toBe(false);
    expect(isSubmissionStatus(3)).toBe(false);
  });
});

describe("knownValues and knownValue", () => {
  it("keeps the known values once each, in the order of the allow-list", () => {
    expect(knownValues(["video", "photo", "photo", "audio"], MEDIA_WANTED)).toEqual([
      "photo",
      "video",
    ]);
    expect(knownValues(["social", "eventScreens"], USAGES)).toEqual(["social", "eventScreens"]);
  });

  it("gives nothing for no value", () => {
    expect(knownValues(undefined, USAGES)).toEqual([]);
    expect(knownValues([], USAGES)).toEqual([]);
  });

  it("keeps a single choice only when it is allowed", () => {
    expect(knownValue("exclusive30", LICENCES)).toBe("exclusive30");
    expect(knownValue("public-domain", LICENCES)).toBeUndefined();
    expect(knownValue(undefined, LICENCES)).toBeUndefined();
  });

  it("lists the two brief statuses", () => {
    expect([...BRIEF_STATUSES]).toEqual(["open", "closed"]);
  });
});

describe("listLimit", () => {
  it("rounds and holds the number between 1 and the maximum", () => {
    expect(listLimit(12.6, 20, 100)).toBe(13);
    expect(listLimit(500, 20, 100)).toBe(100);
    expect(listLimit(-3, 20, 100)).toBe(1);
  });

  it("falls back when there is no usable number", () => {
    expect(listLimit(undefined, 20, 100)).toBe(20);
    expect(listLimit(Number.NaN, 20, 100)).toBe(20);
    expect(listLimit(0, 20, 100)).toBe(20);
  });
});
