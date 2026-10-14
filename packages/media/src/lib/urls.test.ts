import { describe, expect, it } from "vitest";
import { isSafeExternalUrl, pageWithComeBack, safeLocalPath } from "./urls.js";

describe("isSafeExternalUrl", () => {
  it.each([
    "https://example.com",
    "http://example.com/a?b=c",
    "mailto:a@b.c",
    "tel:+33123",
    "  HTTPS://EXAMPLE.COM  ",
  ])("accepts %s", (url) => expect(isSafeExternalUrl(url)).toBe(true));
  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>",
    "vbscript:x",
    "https:evil.com",
    "//evil.com",
    "java\tscript:alert(1)",
    "",
  ])("rejects %s", (url) => expect(isSafeExternalUrl(url)).toBe(false));
});

describe("pageWithComeBack", () => {
  it("adds the place to come back to", () => {
    expect(pageWithComeBack("/en/sites/s/home/register.html", "/en/sites/s/home/a.html")).toBe(
      "/en/sites/s/home/register.html?redirect=%2Fen%2Fsites%2Fs%2Fhome%2Fa.html",
    );
  });

  it("drops a place on another host and refuses a page that is not site-relative", () => {
    expect(pageWithComeBack("/register.html", "//evil.example.com/")).toBe("/register.html");
    expect(pageWithComeBack("https://evil.example.com/r", "/a.html")).toBeUndefined();
    expect(safeLocalPath(String.raw`/\evil.example.com`)).toBeUndefined();
  });
});
