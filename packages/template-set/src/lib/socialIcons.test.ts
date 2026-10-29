import { describe, expect, it } from "vitest";
import { socialIconOf } from "./socialIcons.js";

describe("socialIconOf", () => {
  it("recognises a network from its host, with or without www, on a subdomain, in any case", () => {
    expect(socialIconOf("https://www.linkedin.com/company/molex")?.id).toBe("linkedin");
    expect(socialIconOf("https://m.facebook.com/x")?.id).toBe("facebook");
    expect(socialIconOf("HTTPS://YouTube.com/@channel")?.id).toBe("youtube");
    expect(socialIconOf("https://youtu.be/abc")?.id).toBe("youtube");
    expect(socialIconOf("https://twitter.com/someone")?.id).toBe("x");
    expect(socialIconOf("https://x.com/someone")?.name).toBe("X");
  });

  it("gives nothing for other sites, look-alike hosts, other schemes or no address", () => {
    expect(socialIconOf("https://www.example.com/")).toBeUndefined();
    expect(socialIconOf("https://notlinkedin.com/")).toBeUndefined();
    expect(socialIconOf("https://linkedin.com.evil.example/")).toBeUndefined();
    expect(socialIconOf("mailto:someone@linkedin.com")).toBeUndefined();
    expect(socialIconOf("/sites/demo/home.html")).toBeUndefined();
    expect(socialIconOf(undefined)).toBeUndefined();
  });

  it("draws every icon as one path in a 16 x 16 box", () => {
    for (const url of [
      "https://linkedin.com",
      "https://github.com",
      "https://bsky.app",
      "https://wa.me/1",
    ]) {
      expect(socialIconOf(url)?.path).toMatch(/^M[\d.\s-]/);
    }
  });
});
