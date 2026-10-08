import { describe, expect, it } from "vitest";
import { accountUrls, safeLocalPath } from "./account.js";

describe("safeLocalPath", () => {
  it("keeps a site-relative path, query string included", () => {
    expect(safeLocalPath("/en/sites/s/home.html")).toBe("/en/sites/s/home.html");
    expect(safeLocalPath("/cms/render/live/fr/sites/s/home/a.html?x=1")).toBe(
      "/cms/render/live/fr/sites/s/home/a.html?x=1",
    );
  });

  it.each([
    "https://evil.example.com/x",
    "http://evil.example.com",
    "//evil.example.com/x",
    String.raw`/\evil.example.com`,
    "javascript:alert(1)",
    "data:text/html,x",
    "relative/path",
    "/with space",
    "/line\nbreak",
    "/nul\u0000byte",
    "",
  ])("refuses %j", (url) => {
    expect(safeLocalPath(url)).toBeUndefined();
  });

  it("refuses a missing or oversized value", () => {
    expect(safeLocalPath(undefined)).toBeUndefined();
    expect(safeLocalPath(`/${"a".repeat(3000)}`)).toBeUndefined();
  });
});

describe("accountUrls", () => {
  it("builds the login and logout routes with an encoded redirect", () => {
    const urls = accountUrls("", "/en/sites/s/home/members.html", "/en/sites/s/home.html");
    expect(urls.signIn).toBe("/cms/login?redirect=%2Fen%2Fsites%2Fs%2Fhome%2Fmembers.html");
    expect(urls.signOut).toBe("/cms/logout?redirect=%2Fen%2Fsites%2Fs%2Fhome.html");
    expect(urls.graphql).toBe("/modules/graphql");
  });

  it("encodes a query string so it cannot add a parameter of its own", () => {
    const urls = accountUrls("", "/p.html?a=1&redirect=https://evil.example.com", undefined);
    expect(urls.signIn).toBe(
      "/cms/login?redirect=%2Fp.html%3Fa%3D1%26redirect%3Dhttps%3A%2F%2Fevil.example.com",
    );
  });

  it("prefixes the context path, whatever its shape", () => {
    expect(accountUrls("/jahia", undefined, undefined).signIn).toBe("/jahia/cms/login");
    expect(accountUrls("/jahia/", undefined, undefined).graphql).toBe("/jahia/modules/graphql");
    expect(accountUrls(undefined, undefined, undefined).signOut).toBe("/cms/logout");
    expect(accountUrls("jahia", undefined, undefined).signIn).toBe("/cms/login");
  });

  it("drops a redirect that is not a local path", () => {
    const urls = accountUrls("", "https://evil.example.com/x", "//evil.example.com");
    expect(urls.signIn).toBe("/cms/login");
    expect(urls.signOut).toBe("/cms/logout");
  });
});
