import { describe, expect, it } from "vitest";
import { buildListQuery, isFormat, pathRegex } from "./query.js";

const CAT = "0b9e5c1a-1111-4222-8333-944455556666";
const CAT2 = "0b9e5c1a-1111-4222-8333-944455556667";

describe("buildListQuery", () => {
  it("selects one type under a path, in the asked order", () => {
    expect(
      buildListQuery({ type: "ctmd:story", startPath: "/sites/s/contents", order: "newest" }),
    ).toBe(
      "SELECT * FROM [ctmd:story] AS item WHERE ISDESCENDANTNODE(item, '/sites/s/contents') ORDER BY item.[publicationDate] DESC",
    );
  });

  it("quotes the path as a literal", () => {
    expect(
      buildListQuery({ type: "ctmd:person", startPath: "/sites/a/contents/l'équipe" }),
    ).toContain("'/sites/a/contents/l''équipe'");
  });

  it("filters on categories, formats and a reference", () => {
    const sql = buildListQuery({
      type: "ctmd:story",
      startPath: "/sites/s",
      categories: [CAT, CAT2, "not-a-uuid"],
      formats: ["video", "drop table", "podcast"],
      reference: { property: "authors", id: CAT },
    });
    expect(sql).toContain(
      `(item.[j:defaultCategory] = '${CAT}' OR item.[j:defaultCategory] = '${CAT2}')`,
    );
    expect(sql).toContain("(item.[format] = 'video' OR item.[format] = 'podcast')");
    expect(sql).toContain(`item.[authors] = '${CAT}'`);
    expect(sql).not.toContain("drop");
    expect(sql).not.toContain("not-a-uuid");
  });

  it("writes one condition without parentheses for a single value", () => {
    expect(buildListQuery({ type: "ctmd:story", startPath: "/s", formats: ["news"] })).toContain(
      "AND item.[format] = 'news'",
    );
  });

  it("refuses an unknown type, a relative path, an unknown order and a bad identifier", () => {
    expect(() => buildListQuery({ type: "ctmd:story] AS x --", startPath: "/s" })).toThrow();
    expect(() => buildListQuery({ type: "ctmd:story", startPath: "sites/a" })).toThrow();
    expect(() =>
      buildListQuery({ type: "ctmd:story", startPath: "/s", order: "x" as "none" }),
    ).toThrow();
    expect(() =>
      buildListQuery({
        type: "ctmd:session",
        startPath: "/s",
        reference: { property: "person", id: "1' OR 1=1" },
      }),
    ).toThrow();
  });
});

describe("buildListQuery for briefs and submissions", () => {
  it("orders briefs by deadline and keeps the open ones", () => {
    expect(
      buildListQuery({
        type: "ctmd:brief",
        startPath: "/sites/p/contents/briefs",
        order: "deadline",
        statuses: ["open"],
      }),
    ).toBe(
      "SELECT * FROM [ctmd:brief] AS item WHERE ISDESCENDANTNODE(item, '/sites/p/contents/briefs') AND item.[briefStatus] = 'open' ORDER BY item.[deadline] ASC",
    );
  });

  it("orders submissions newest first and filters on their own status property", () => {
    const sql = buildListQuery({
      type: "ctmd:suppliedStory",
      startPath: "/sites/p",
      order: "created",
      statuses: ["accepted", "inReview"],
    });
    expect(sql).toContain(
      "(item.[moderationStatus] = 'accepted' OR item.[moderationStatus] = 'inReview')",
    );
    expect(sql.endsWith("ORDER BY item.[jcr:created] DESC")).toBe(true);
  });

  it("adds no status condition when none is asked for", () => {
    expect(buildListQuery({ type: "ctmd:brief", startPath: "/s" })).not.toContain("Status");
  });

  it("refuses an unknown status, and a status on a type that has none", () => {
    expect(() =>
      buildListQuery({ type: "ctmd:brief", startPath: "/s", statuses: ["open' OR 1=1"] }),
    ).toThrow();
    expect(() =>
      buildListQuery({ type: "ctmd:brief", startPath: "/s", statuses: ["accepted"] }),
    ).toThrow();
    expect(() =>
      buildListQuery({ type: "ctmd:story", startPath: "/s", statuses: ["open"] }),
    ).toThrow();
  });
});

describe("isFormat", () => {
  it("knows the seven formats only", () => {
    expect(isFormat("podcast")).toBe(true);
    expect(isFormat("blog")).toBe(false);
    expect(isFormat(undefined)).toBe(false);
  });
});

describe("pathRegex", () => {
  it("escapes regular expression characters", () => {
    expect(pathRegex("/sites/a.b/(x)")).toBe(String.raw`/sites/a\.b/\(x\)`);
  });
});
