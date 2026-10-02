import { describe, expect, it } from "vitest";
import { isSafeExternalUrl } from "./urls.js";

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
