import { describe, expect, it } from "vitest";
import { DEFAULT_TEASER_PARAGRAPHS, teaserHtml, teaserParagraphs } from "./teaser.js";

const body =
  "<h2>Intro</h2><p>One.</p><p>Two <em>bold</em>.</p><p>Three.</p><p>Four, the secret.</p>";

describe("teaserHtml", () => {
  it("keeps the first paragraphs and what comes before them", () => {
    expect(teaserHtml(body, 2)).toBe("<h2>Intro</h2><p>One.</p><p>Two <em>bold</em>.</p>");
  });

  it("never gives the whole body away", () => {
    expect(teaserHtml(body, 4)).toBe(
      "<h2>Intro</h2><p>One.</p><p>Two <em>bold</em>.</p><p>Three.</p>",
    );
    expect(teaserHtml(body, 10)).not.toContain("secret");
    expect(teaserHtml("<p>Only one.</p>", 2)).toBe("");
  });

  it("shows nothing for 0 paragraphs or an empty body", () => {
    expect(teaserHtml(body, 0)).toBe("");
    expect(teaserHtml(undefined, 2)).toBe("");
    expect(teaserHtml("", 2)).toBe("");
  });

  it("counts paragraphs inside plain wrappers and closes the wrappers at the cut", () => {
    expect(teaserHtml("<div><p>A</p><p>B</p><p>C</p></div>", 1)).toBe("<div><p>A</p></div>");
  });

  it("does not count paragraphs of a list, a quote or a table", () => {
    const html = "<blockquote><p>q1</p><p>q2</p></blockquote><p>A</p><p>B</p>";
    expect(teaserHtml(html, 1)).toBe("<blockquote><p>q1</p><p>q2</p></blockquote><p>A</p>");
  });

  it("reads a paragraph left open as a browser does", () => {
    expect(teaserHtml("<p>A<p>B<p>C", 1)).toBe("<p>A");
    expect(teaserHtml("<p>A<p>B<p>C", 2)).toBe("<p>A<p>B");
  });

  it("is not fooled by markup in attributes or comments", () => {
    const html = '<!-- <p>x</p> --><p title="a > b">A</p><p data-x="</p>">B</p><p>C</p>';
    expect(teaserHtml(html, 1)).toBe('<!-- <p>x</p> --><p title="a > b">A</p>');
  });

  it("keeps void elements and figures before the cut", () => {
    const html = '<figure><img src="/a.png" alt="A"></figure><p>A<br>a</p><p>B</p>';
    expect(teaserHtml(html, 1)).toBe('<figure><img src="/a.png" alt="A"></figure><p>A<br>a</p>');
  });
});

describe("teaserParagraphs", () => {
  it("defaults when the item does not say", () => {
    expect(teaserParagraphs(undefined)).toBe(DEFAULT_TEASER_PARAGRAPHS);
    expect(teaserParagraphs("x")).toBe(DEFAULT_TEASER_PARAGRAPHS);
  });

  it("clamps to 0..10", () => {
    expect(teaserParagraphs(-1)).toBe(0);
    expect(teaserParagraphs(25)).toBe(10);
    expect(teaserParagraphs("3")).toBe(3);
    expect(teaserParagraphs(0)).toBe(0);
  });
});
