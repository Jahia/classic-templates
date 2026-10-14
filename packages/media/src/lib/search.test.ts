import { describe, expect, it } from "vitest";
import {
  excerptParts,
  highlightWords,
  kindKey,
  pageNumber,
  readableExcerpt,
  resultText,
  searchWords,
} from "./search.js";

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

describe("readableExcerpt", () => {
  const text = (excerpt: string, max?: number) =>
    readableExcerpt(excerptParts(excerpt), max)
      .map((p) => (p.hit ? `[${p.text}]` : p.text))
      .join("");

  it("extends a highlighted stem to the whole word", () => {
    expect(text("free <em>streamin</em>g channels")).toBe("free [streaming] channels");
    expect(text("the <em>stream</em>ing <em>pre</em>view")).toBe("the [streaming] [preview]");
  });

  it("separates passages the index glued together", () => {
    expect(text("linear audiences.This panel")).toBe("linear audiences. … This panel");
    expect(text("reach a plateauPaid tiers")).toBe("reach a plateau … Paid tiers");
    expect(text("the iPhone and FAST channels on YouTube")).toBe(
      "the iPhone and FAST channels on YouTube",
    );
  });

  it("keeps a short window around the first highlight, cut at word boundaries", () => {
    const long = `${"word ".repeat(60)}the <em>match</em> here ${"tail ".repeat(60)}`;
    const out = text(long, 80);
    expect(out.startsWith("… ")).toBe(true);
    expect(out.endsWith(" …")).toBe(true);
    expect(out).toContain("[match]");
    expect(out.length).toBeLessThanOrEqual(80 + 4);
    expect(out).not.toMatch(/ wor$| wo …/);
  });

  it("leaves a short excerpt alone and numbers the keys", () => {
    const parts = readableExcerpt(excerptParts("Free <em>channels</em> pass."));
    expect(parts.map((p) => p.at)).toEqual([0, 1, 2]);
    expect(parts.map((p) => p.text).join("")).toBe("Free channels pass.");
  });
});

describe("resultText", () => {
  const show = (parts: { text: string; hit: boolean }[]) =>
    parts.map((p) => (p.hit ? `[${p.text}]` : p.text)).join("");

  it("highlights the searched words in the item's own summary first", () => {
    const hit = {
      excerpt: "runs the features desk and writes on <em>streamin</em>g",
      summary: "Streaming grows, free channels too.",
    };
    expect(show(resultText(hit, "stream"))).toBe("[Streaming] grows, free channels too.");
  });

  it("keeps its own summary when it does not hold the words (the excerpt may describe a related item)", () => {
    const hit = { excerpt: "a <em>remote</em> crew", summary: "A season of football." };
    expect(show(resultText(hit, "remote"))).toBe("A season of football.");
  });

  it("uses the index excerpt only without a summary", () => {
    expect(show(resultText({ excerpt: "a <em>remote</em> crew", summary: "" }, "remote"))).toBe(
      "a [remote] crew",
    );
  });

  it("shows the summary as is without words, and nothing without text", () => {
    expect(show(resultText({ excerpt: "", summary: "Plain." }, ""))).toBe("Plain.");
    expect(resultText({ excerpt: "", summary: "" }, "x")).toEqual([]);
  });

  it("matches accents and case, and ignores one-letter words", () => {
    expect(show(highlightWords("Média et télévision", "media a") ?? [])).toBe(
      "[Média] et télévision",
    );
    expect(highlightWords("Nothing here", "zz")).toBeUndefined();
  });

  it("never shows a highlight cut by the window", () => {
    const long = `${"word ".repeat(70)}<em>streaming</em>`;
    expect(show(readableExcerpt(excerptParts(long), 40))).not.toMatch(/\[st\]|\[s\]/);
  });
});
