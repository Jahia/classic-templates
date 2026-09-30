import { describe, expect, it } from "vitest";
import { isSafeRichTextUrl, sanitizeRichText, sanitizeRichTextWithReport } from "./sanitize.js";

describe("sanitizeRichText", () => {
  it("keeps editorial markup", () => {
    const html =
      "<h2>T</h2><p>a <strong>b</strong> <em>c</em></p><ul><li>d</li></ul><blockquote>q</blockquote>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("drops scripts with their content, event handlers and inline styles", () => {
    const out = sanitizeRichText(
      '<p style="color:red" onclick="x()">ok</p><script>alert(2)</script><img src="/a.png" onerror="alert(1)">',
    );
    expect(out).toBe('<p>ok</p><img alt="" src="/a.png">');
  });

  it("drops javascript: and data: URLs, including encoded or split ones", () => {
    for (const href of [
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      "java\tscript:x",
      "javascript&#58;alert(1)",
      "data:text/html,x",
      "//evil.com",
    ]) {
      expect(sanitizeRichText(`<a href="${href}">x</a>`)).toBe("<a>x</a>");
    }
  });

  it("keeps safe links, Jahia internal link placeholders and relative paths", () => {
    for (const href of [
      "https://jahia.com",
      "mailto:a@b.c",
      "/sites/x/home.html",
      "##cms-context##/{mode}/{lang}/sites/x/home.html",
      "page.html",
    ]) {
      expect(sanitizeRichText(`<a href="${href}">x</a>`)).toContain(`href="${href}"`);
    }
    // Anchors point at the prefixed ids of the text's own headings.
    expect(sanitizeRichText('<a href="#top">x</a>')).toContain('href="#ctpl-rt-top"');
  });

  it("turns an h1 into an h2 (the page owns the h1), dropping its handlers", () => {
    expect(sanitizeRichText('<h1 onclick="x()" id="a">T</h1>')).toBe('<h2 id="ctpl-rt-a">T</h2>');
  });

  it("opens links in the same tab (a new window would have to be announced)", () => {
    expect(sanitizeRichText('<a href="https://x.org" target="_blank" rel="opener">x</a>')).toBe(
      '<a href="https://x.org">x</a>',
    );
  });

  it("drops iframes, forms and unknown tags but keeps their text", () => {
    expect(
      sanitizeRichText('<iframe src="https://x"></iframe><form><input></form><custom>t</custom>'),
    ).toBe("t");
  });

  it("keeps tables", () => {
    const html =
      '<table><thead><tr><th scope="col">h</th></tr></thead><tbody><tr><td colspan="2">d</td></tr></tbody></table>';
    expect(sanitizeRichText(html)).toBe(html);
  });
});

describe("isSafeRichTextUrl", () => {
  it("rejects a scheme hidden behind a relative-looking path", () => {
    expect(isSafeRichTextUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeRichTextUrl("images/a.png")).toBe(true);
  });
});

describe("sanitizeRichText - accessibility (RGAA)", () => {
  it("keeps the language of a phrase and drops invalid ones", () => {
    expect(sanitizeRichText('<p>Say <span lang="en">hello</span></p>')).toBe(
      '<p>Say <span lang="en">hello</span></p>',
    );
    expect(sanitizeRichText('<span lang="x&quot;onclick=1">a</span>')).toBe("<span>a</span>");
  });

  it("keeps definition lists", () => {
    expect(sanitizeRichText("<dl><dt>Term</dt><dd>Definition</dd></dl>")).toBe(
      "<dl><dt>Term</dt><dd>Definition</dd></dl>",
    );
  });

  it("keeps table header associations, with prefixed ids", () => {
    expect(
      sanitizeRichText(
        '<table role="presentation"><tr><th id="h1" scope="col">A</th></tr><tr><td headers="h1">1</td></tr></table>',
      ),
    ).toBe(
      '<table role="presentation"><tr><th id="ctpl-rt-h1" scope="col">A</th></tr><tr><td headers="ctpl-rt-h1">1</td></tr></table>',
    );
    expect(sanitizeRichText('<table role="button"><tr><td>x</td></tr></table>')).toBe(
      "<table><tr><td>x</td></tr></table>",
    );
  });

  it("prefixes editor ids and the anchors pointing at them", () => {
    expect(sanitizeRichText('<h2 id="faq">FAQ</h2><a href="#faq">up</a>')).toBe(
      '<h2 id="ctpl-rt-faq">FAQ</h2><a href="#ctpl-rt-faq">up</a>',
    );
  });

  it("drops link targets and titles, and image titles", () => {
    expect(sanitizeRichText('<a href="https://x.org" target="_blank" title="t">x</a>')).toBe(
      '<a href="https://x.org">x</a>',
    );
    expect(sanitizeRichText('<img src="/a.png" alt="" title="t">')).toBe(
      '<img src="/a.png" alt="">',
    );
  });

  it("drops attributes that are not allowed on the element, even lang-like ones", () => {
    expect(sanitizeRichText('<p id="x" headers="y" role="presentation">a</p>')).toBe("<p>a</p>");
  });

  it("renumbers headings under the section and never skips a level", () => {
    expect(sanitizeRichText("<h2>A</h2><h4>B</h4>", { headingLevel: 3 })).toBe(
      "<h3>A</h3><h4>B</h4>",
    );
    expect(sanitizeRichText("<h4>A</h4><h2>B</h2>", { headingLevel: 3 })).toBe(
      "<h3>A</h3><h3>B</h3>",
    );
    expect(sanitizeRichText("<h1>A</h1><h3>B</h3>")).toBe("<h2>A</h2><h3>B</h3>");
    expect(
      sanitizeRichText("<h2>A</h2><h3>B</h3><h4>C</h4><h5>D</h5><h6>E</h6>", { headingLevel: 4 }),
    ).toBe("<h4>A</h4><h5>B</h5><h6>C</h6><h6>D</h6><h6>E</h6>");
  });

  it('gives an image without a text alternative alt="" and reports it', () => {
    expect(sanitizeRichTextWithReport('<img src="/a.png">')).toEqual({
      html: '<img alt="" src="/a.png">',
      imageWithoutAlt: true,
    });
    expect(sanitizeRichTextWithReport('<img src="/a.png" alt="">').imageWithoutAlt).toBe(false);
    // The pattern is global: a second call starts from the beginning again.
    expect(sanitizeRichTextWithReport('<img src="/b.png">').imageWithoutAlt).toBe(true);
  });

  it("prefixes ids per block, so two blocks never share one", () => {
    const one = sanitizeRichText('<h2 id="intro">A</h2>', { idPrefix: "rt-aaaa-" });
    const two = sanitizeRichText('<h2 id="intro">A</h2>', { idPrefix: "rt-bbbb-" });
    expect(one).toBe('<h2 id="rt-aaaa-intro">A</h2>');
    expect(two).toBe('<h2 id="rt-bbbb-intro">A</h2>');
    expect(sanitizeRichText('<h2 id="intro">A</h2>', { idPrefix: '"><script>' })).toBe(
      '<h2 id="ctpl-rt-intro">A</h2>',
    );
  });
});
