import { describe, expect, it } from "vitest";
import { buildListQuery, literal, pathRegex } from "./query.js";

describe("buildListQuery", () => {
  it("queries one type under a start node", () => {
    expect(buildListQuery("ctrv:fareOffer", "/sites/skylantern/contents/fares")).toBe(
      "SELECT * FROM [ctrv:fareOffer] AS item WHERE ISDESCENDANTNODE(item, '/sites/skylantern/contents/fares')",
    );
  });

  it("quotes the path as a literal", () => {
    expect(buildListQuery("ctrv:destination", "/sites/a/contents/l'été")).toContain(
      "ISDESCENDANTNODE(item, '/sites/a/contents/l''été')",
    );
  });

  it("refuses any other type and anything that is not a path", () => {
    expect(() => buildListQuery("ctpl:news", "/sites/a")).toThrow();
    expect(() => buildListQuery("ctrv:fareOffer] AS x WHERE 1=1 --", "/sites/a")).toThrow();
    expect(() => buildListQuery("ctrv:fareOffer", "sites/a")).toThrow();
  });
});

describe("helpers", () => {
  it("doubles single quotes in literals", () => {
    expect(literal("a'b''c")).toBe("'a''b''''c'");
  });

  it("escapes a path for a cache-flush regular expression", () => {
    expect(pathRegex("/sites/a.b/contents(1)")).toBe(String.raw`/sites/a\.b/contents\(1\)`);
    expect(new RegExp(`^${pathRegex("/sites/a.b")}(/.*)?$`).test("/sites/a.b/x")).toBe(true);
    expect(new RegExp(`^${pathRegex("/sites/a.b")}(/.*)?$`).test("/sites/aXb/x")).toBe(false);
  });
});
