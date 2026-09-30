import { describe, expect, it } from "vitest";
import { isSafeRichTextUrl, sanitizeRichText } from "./sanitize.js";

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
    expect(out).toBe('<p>ok</p><img src="/a.png">');
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
      "#top",
      "##cms-context##/{mode}/{lang}/sites/x/home.html",
      "page.html",
    ]) {
      expect(sanitizeRichText(`<a href="${href}">x</a>`)).toContain(`href="${href}"`);
    }
  });

  it("turns an h1 into a bare h2 (the page owns the h1), dropping its attributes", () => {
    expect(sanitizeRichText('<h1 onclick="x()" id="a">T</h1>')).toBe("<h2>T</h2>");
  });

  it("adds rel=noopener to links opening a new tab", () => {
    expect(sanitizeRichText('<a href="https://x.org" target="_blank">x</a>')).toBe(
      '<a href="https://x.org" target="_blank" rel="noopener noreferrer">x</a>',
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
