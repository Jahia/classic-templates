import { describe, expect, it } from "vitest";
import { excerptParts, kindKey, pageNumber, searchWords } from "./search.js";

describe("excerptParts", () => {
  it("splits the excerpt on the highlighter tags", () => {
    expect(excerptParts("Free <em>channels</em> pass a <em>milestone</em>.")).toEqual([
      { text: "Free ", hit: false, at: 0 },
      { text: "channels", hit: true, at: 9 },
      { text: " pass a ", hit: false, at: 22 },
      { text: "milestone", hit: true, at: 34 },
      { text: ".", hit: false, at: 48 },
    ]);
  });

  it("drops any other markup and decodes entities, so nothing is HTML", () => {
    expect(
      excerptParts("<script>x()</script>R&amp;D <img src=x onerror=1><em>&lt;b&gt;</em>").map(
        ({ text, hit }) => ({ text, hit }),
      ),
    ).toEqual([
      { text: "x()R&D ", hit: false },
      { text: "<b>", hit: true },
    ]);
  });

  it("returns nothing for no excerpt", () => {
    expect(excerptParts(undefined)).toEqual([]);
    expect(excerptParts("")).toEqual([]);
  });
});

describe("request helpers", () => {
  it("reads a sane page number", () => {
    expect(pageNumber("3")).toBe(3);
    expect(pageNumber("0")).toBe(1);
    expect(pageNumber("-2")).toBe(1);
    expect(pageNumber("abc")).toBe(1);
    expect(pageNumber(null)).toBe(1);
    expect(pageNumber("99999")).toBe(1);
  });

  it("trims and caps the words", () => {
    expect(searchWords("  streaming  ")).toBe("streaming");
    expect(searchWords(null)).toBe("");
    expect(searchWords("x".repeat(300))).toHaveLength(200);
  });

  it("labels known node types", () => {
    expect(kindKey("ctmd:story")).toBe("search.kind.story");
    expect(kindKey("jnt:page")).toBe("search.kind.page");
    expect(kindKey("jnt:file")).toBe("search.kind.other");
    expect(kindKey(undefined)).toBe("search.kind.other");
  });
});
