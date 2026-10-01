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
    // An anchor to an id the text does not declare points at the page, and is kept as written.
    expect(sanitizeRichText('<a href="#top">x</a>')).toContain('href="#top"');
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

const P = "rt-0b1c2d3e-";

describe("sanitizeRichText - URLs and attribute values", () => {
  it("drops URL schemes hidden behind character references or control characters", () => {
    for (const href of [
      "jav&#x09;ascript:alert(1)",
      "vbscript:x",
      "&#47;&#47;example.com",
      String.raw`/\example.com/a`,
      "/&#9;/example.com/a",
      "/\t/example.com",
      String.raw`\\x`,
    ]) {
      expect(sanitizeRichText(`<a href="${href}">x</a>`)).toBe("<a>x</a>");
    }
  });

  it("keeps the other allowed links as written", () => {
    for (const href of [
      "http://jahia.com/a?b=1",
      "tel:+33100000000",
      "##doc-context##/{workspace}/sites/x/files/a.pdf",
      "files/a.pdf#page=2",
      "../up.html",
      "?q=1",
    ]) {
      expect(sanitizeRichText(`<a href="${href}">x</a>`)).toBe(`<a href="${href}">x</a>`);
    }
  });

  it("writes URLs as the browser reads them", () => {
    // `&num` before "=" stays as written in an attribute; `&amp;` is the same "&" encoded.
    expect(sanitizeRichText('<a href="https://ex.test/s?q=a&num=10&copy=1">x</a>')).toBe(
      '<a href="https://ex.test/s?q=a&amp;num=10&amp;copy=1">x</a>',
    );
    expect(sanitizeRichText('<a href="https://ex.test/s?a=1&amp;b=2">x</a>')).toBe(
      '<a href="https://ex.test/s?a=1&amp;b=2">x</a>',
    );
  });

  it("decodes character references in attributes with the full HTML table, case-sensitive", () => {
    expect(sanitizeRichText('<img src="/x.png" alt="&uuml;ber &Agrave; &ntilde; &szlig;">')).toBe(
      '<img src="/x.png" alt="über À ñ ß">',
    );
    expect(sanitizeRichText('<img src="/x.png" alt="a &quot;b&quot; &lt;c&gt;">')).toBe(
      '<img src="/x.png" alt="a &quot;b&quot; &lt;c&gt;">',
    );
  });

  it("keeps numbers only in numeric attributes", () => {
    expect(sanitizeRichText('<ol start="3" reversed><li>a</li></ol>')).toBe(
      '<ol start="3" reversed=""><li>a</li></ol>',
    );
    expect(sanitizeRichText('<img src="/a.png" alt="" width="10px" height="20">')).toBe(
      '<img src="/a.png" alt="" height="20">',
    );
  });

  it("keeps the first of two attributes with the same name, as the browser does", () => {
    expect(sanitizeRichText('<a href="/a" href="/b">x</a>')).toBe('<a href="/a">x</a>');
  });

  it("keeps the direction of a text and drops invalid ones", () => {
    expect(sanitizeRichText('<p dir="rtl">a</p><p dir="up">b</p>')).toBe(
      '<p dir="rtl">a</p><p>b</p>',
    );
  });
});

describe("sanitizeRichText - elements left out", () => {
  it("returns an empty string for an empty value", () => {
    expect(sanitizeRichText("")).toBe("");
  });

  it("leaves out void and document-level tags without losing the text after them", () => {
    expect(sanitizeRichText('<p>a</p><embed src="/x.swf"><p>b</p>')).toBe("<p>a</p><p>b</p>");
    expect(sanitizeRichText('<p>a</p><frame src="/x"><p>b</p>')).toBe("<p>a</p><p>b</p>");
    expect(sanitizeRichText("<head><p>a</p></head><p>b</p>")).toBe("<p>a</p><p>b</p>");
    expect(sanitizeRichText("<p>a</p><frameset><p>b</p>")).toBe("<p>a</p><p>b</p>");
  });

  it("never writes a placeholder for what it leaves out", () => {
    for (const html of [
      '<p>a</p><embed src="/x.swf"><p>b</p>',
      "<p>a</p><object><param></object><p>b</p>",
      "<p>a</p><script>x()</script><noscript>n</noscript><p>b</p>",
    ]) {
      expect(sanitizeRichText(html)).not.toContain("[removed]");
    }
  });

  it("closes a self-closing svg or math element right away", () => {
    expect(sanitizeRichText("<p>a<svg/>b</p><p>c</p>")).toBe("<p>ab</p><p>c</p>");
    expect(sanitizeRichText("<p>a<math/>b</p><p>c</p>")).toBe("<p>ab</p><p>c</p>");
    expect(sanitizeRichText("<p>a<svg><svg></svg><text>x</text></svg>b</p>")).toBe("<p>ab</p>");
  });

  it("leaves out an element with its content until its end tag, or the end of the text", () => {
    expect(sanitizeRichText("<p>a</p><style>p{color:red}</style><p>b</p>")).toBe(
      "<p>a</p><p>b</p>",
    );
    expect(sanitizeRichText("<p>a</p><style>p{color:red}")).toBe("<p>a</p>");
  });
});

describe("sanitizeRichText - text and markup boundaries", () => {
  it("keeps text as written, and a '<' that starts no tag as text", () => {
    expect(sanitizeRichText("<p>1 &lt; 2 &amp; R&D</p>")).toBe("<p>1 &lt; 2 &amp; R&D</p>");
    expect(sanitizeRichText("<p>1 < 2 and 3 > 2</p>")).toBe("<p>1 &lt; 2 and 3 &gt; 2</p>");
  });

  it("reads an abruptly closed comment as an empty comment", () => {
    expect(sanitizeRichText("<p>a<!-->b</p><p>c</p><!-- x -->d")).toBe("<p>ab</p><p>c</p>d");
    expect(sanitizeRichText("<p>a<!--->b</p>")).toBe("<p>ab</p>");
  });

  it("keeps the markup around a dotted capital I (a lower case of another length)", () => {
    expect(sanitizeRichText("<p>İstanbul</p><p>b</p>")).toBe("<p>İstanbul</p><p>b</p>");
    expect(sanitizeRichText("İ<style>body{color:red}</style><p>a</p>")).toBe("İ<p>a</p>");
    // "<" before a letter outside a-z is text for the browser too.
    expect(sanitizeRichText("<İ>x</İ><b>y</b><style>i{}</style>z")).toBe("&lt;İ&gt;x<b>y</b>z");
    expect(sanitizeRichText('<p title="İ">a</p><STYLE>b{}</STYLE>c')).toBe("<p>a</p>c");
  });

  it("reads </br> as a line break, as the browser does", () => {
    expect(sanitizeRichText("<p>a</br>b</p>")).toBe("<p>a<br>b</p>");
  });

  it("closes every element inside the block and leaves out closing tags with no element", () => {
    expect(sanitizeRichText("<p><strong>a")).toBe("<p><strong>a</strong></p>");
    expect(sanitizeRichText("</div></section><p>a</p></div>")).toBe("<p>a</p>");
    expect(sanitizeRichText("<ul><li><em>a</li></ul>b")).toBe("<ul><li><em>a</em></li></ul>b");
  });

  it("closes a heading before the next one starts, with matching levels", () => {
    expect(sanitizeRichText("<h2>a<h3>b</h3>c</h2>", { headingLevel: 3 })).toBe(
      "<h3>a</h3><h4>b</h4>c",
    );
    expect(sanitizeRichText("<h2><em>a</h2>b", { headingLevel: 3 })).toBe("<h3><em>a</em></h3>b");
  });

  it("leaves out a tag cut by the end of the text", () => {
    expect(sanitizeRichText('<p>a</p><a href="/x')).toBe('<p>a</p>&lt;a href="/x');
    expect(sanitizeRichText("<p>a</p><b")).toBe("<p>a</p>");
  });

  it("runs in linear time, long tags included", () => {
    const inputs = [
      "</p>".repeat(280_000), // 1.12M characters of closing tags with no element
      "<p>".repeat(370_000),
      "<p><b>".repeat(100_000) + "</p>".repeat(100_000),
      `<p ${"a ".repeat(200_000)}>x</p>`,
      `<p ${"a= ".repeat(100_000)}>x</p>`,
      `<a href="/x" ${"title=y ".repeat(10_000)}>x</a>`, // an 80 KB tag
      "a<".repeat(500_000),
      "<h2>".repeat(100_000) + "</h3>".repeat(100_000),
      '<a href="#x">'.repeat(100_000),
    ];
    for (const input of inputs) {
      const start = performance.now();
      sanitizeRichText(input);
      expect(performance.now() - start).toBeLessThan(1000);
    }
  });
});

describe("sanitizeRichText - ids and anchors", () => {
  it("prefixes the anchors to an id declared in the same block, after or before it", () => {
    expect(sanitizeRichText('<a href="#faq">up</a><h2 id="faq">FAQ</h2>', { idPrefix: P })).toBe(
      `<a href="#${P}faq">up</a><h2 id="${P}faq">FAQ</h2>`,
    );
  });

  it("keeps anchors to other targets of the page as written", () => {
    expect(sanitizeRichText('<a href="#main-content">x</a>', { idPrefix: P })).toBe(
      '<a href="#main-content">x</a>',
    );
    // An id the allow-list leaves out (here on a paragraph) is not a target of the block.
    expect(sanitizeRichText('<p id="x">a</p><a href="#x">b</a>', { idPrefix: P })).toBe(
      '<p>a</p><a href="#x">b</a>',
    );
  });

  it("keeps the first of two elements with the same id", () => {
    expect(sanitizeRichText('<h2 id="a">1</h2><h2 id="a">2</h2>', { idPrefix: P })).toBe(
      `<h2 id="${P}a">1</h2><h2>2</h2>`,
    );
  });

  it("leaves out ids that are not plain identifiers", () => {
    expect(sanitizeRichText('<h2 id="1a">a</h2><h2 id="a b">b</h2>')).toBe("<h2>a</h2><h2>b</h2>");
  });
});

describe("isSafeRichTextUrl - characters the browser ignores", () => {
  it("rejects a scheme behind a relative-looking path", () => {
    expect(isSafeRichTextUrl("a/b:c")).toBe(false);
  });

  it("rejects backslashes and control characters anywhere", () => {
    expect(isSafeRichTextUrl(String.raw`/a\b`)).toBe(false);
    expect(isSafeRichTextUrl("/a\nb")).toBe(false);
    expect(isSafeRichTextUrl("\u0001/a")).toBe(false);
    expect(isSafeRichTextUrl("  /a  ")).toBe(true);
  });

  it("reads astral characters as one code point, never as a control character or a backslash", () => {
    expect(isSafeRichTextUrl("/a/\u{1F600}")).toBe(true);
    expect(isSafeRichTextUrl("/a/\u{10001}")).toBe(true); // low 16 bits: U+0001
    expect(isSafeRichTextUrl("/a/\u{1005C}")).toBe(true); // low 16 bits: "\"
    expect(sanitizeRichText('<a href="/a/\u{1F600}">x</a>')).toBe('<a href="/a/\u{1F600}">x</a>');
  });
});
