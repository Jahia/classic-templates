import { describe, expect, it } from "vitest";
import { destinationOf, loginOutcome } from "./signin.js";

describe("destinationOf", () => {
  const fallback = "/en/sites/s/home/members.html";

  it("follows the redirect parameter when it is a site-relative path", () => {
    expect(destinationOf("?redirect=%2Fen%2Fsites%2Fs%2Fhome%2Fnews.html", fallback)).toBe(
      "/en/sites/s/home/news.html",
    );
  });

  it("keeps the query string of the destination", () => {
    expect(destinationOf("?redirect=%2Fen%2Fa.html%3Fx%3D1%26y%3D2", fallback)).toBe(
      "/en/a.html?x=1&y=2",
    );
  });

  it("falls back to the current page without a redirect parameter", () => {
    expect(destinationOf("", fallback)).toBe(fallback);
    expect(destinationOf("?other=1", fallback)).toBe(fallback);
  });

  it.each([
    "?redirect=https%3A%2F%2Fevil.example.com%2Fx",
    "?redirect=%2F%2Fevil.example.com",
    "?redirect=%2F%5Cevil.example.com",
    "?redirect=javascript%3Aalert(1)",
    "?redirect=data%3Atext%2Fhtml%2Cx",
    "?redirect=relative%2Fpath",
    "?redirect=%2Fwith%20space",
    "?redirect=%2Fline%0Abreak",
    "?redirect=",
  ])("never follows %s: it falls back to the current page", (search) => {
    expect(destinationOf(search, fallback)).toBe(fallback);
  });

  it("stays on the current page when the form sits on the page it unlocks", () => {
    expect(destinationOf("", fallback, "/fr/sites/s/home/news/a.html?x=1")).toBe(
      "/fr/sites/s/home/news/a.html?x=1",
    );
  });

  it("still prefers a safe redirect parameter to the current page", () => {
    expect(destinationOf("?redirect=%2Fb.html", fallback, "/a.html")).toBe("/b.html");
  });

  it("ignores an unsafe current address and falls back", () => {
    expect(destinationOf("", fallback, "//evil.example.com")).toBe(fallback);
  });

  it("returns undefined when neither the parameter nor the fallback is safe", () => {
    expect(
      destinationOf("?redirect=//evil.example.com", "https://evil.example.com"),
    ).toBeUndefined();
    expect(destinationOf("")).toBeUndefined();
  });

  it("reads only the first redirect parameter", () => {
    expect(destinationOf("?redirect=%2Fa.html&redirect=%2Fb.html", fallback)).toBe("/a.html");
  });
});

describe("loginOutcome", () => {
  it("reads OK as signed in, whatever the case or the padding", () => {
    expect(loginOutcome({ ok: true, redirected: false, body: "OK" })).toBe("signedIn");
    expect(loginOutcome({ ok: true, redirected: false, body: " ok\n" })).toBe("signedIn");
  });

  it("reads a redirect as signed in", () => {
    expect(loginOutcome({ ok: true, redirected: true, body: "<html>" })).toBe("signedIn");
  });

  it("reads unauthorized as a refusal", () => {
    expect(loginOutcome({ ok: true, redirected: false, body: "unauthorized" })).toBe("rejected");
    expect(loginOutcome({ ok: false, redirected: false, body: "Unauthorized" })).toBe("rejected");
  });

  it("does not take an OK body of a failed response as a sign-in", () => {
    expect(loginOutcome({ ok: false, redirected: false, body: "OK" })).toBe("unknown");
  });

  it("reads anything else as an unknown failure, not a refusal", () => {
    expect(loginOutcome({ ok: false, redirected: false, body: "Internal error" })).toBe("unknown");
    expect(loginOutcome({ ok: true, redirected: false, body: "" })).toBe("unknown");
  });
});
