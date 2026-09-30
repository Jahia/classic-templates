import { describe, expect, it } from "vitest";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { buildListQuery } from "./query.js";

const node = (path: string) => ({ getPath: () => path }) as unknown as JCRNodeWrapper;
const start = node("/sites/demo/contents/news");
const uuid = "0c14bd3c-68bc-4109-80f5-9b2f8d6ee82e";

describe("buildListQuery", () => {
  it("builds the default query: type under the start node, newest first", () => {
    expect(buildListQuery({ type: "ctpl:news", start })).toBe(
      "SELECT * FROM [ctpl:news] AS item WHERE ISDESCENDANTNODE(item, '/sites/demo/contents/news') ORDER BY item.[publicationDate] DESC",
    );
  });

  it("only lets allow-listed sort fields and directions through", () => {
    expect(
      buildListQuery({ type: "ctpl:news", start, criteria: "jcr:title", direction: "asc" }),
    ).toContain("ORDER BY item.[jcr:title] ASC");
    const q = buildListQuery({
      type: "ctpl:news",
      start,
      criteria: "x] OR 1=1 --",
      direction: "sideways",
    });
    expect(q).toContain("ORDER BY item.[publicationDate] DESC");
    expect(q).not.toContain("OR 1=1");
  });

  it("rejects anything that is not a node type name", () => {
    expect(() => buildListQuery({ type: "ctpl:news] AS x WHERE 1=1 --", start })).toThrow();
    expect(() => buildListQuery({ type: "news", start })).toThrow();
  });

  it("quotes the start path as a literal", () => {
    expect(buildListQuery({ type: "ctpl:news", start: node("/sites/o'brien") })).toContain(
      "'/sites/o''brien'",
    );
  });

  it("ORs the category identifiers and drops anything that is not a UUID", () => {
    const q = buildListQuery({ type: "ctpl:news", start, categories: [uuid, "' OR 1=1 --"] });
    expect(q).toContain(`AND (item.[j:defaultCategory] = '${uuid}')`);
    expect(q).not.toContain("1=1");
  });
});
