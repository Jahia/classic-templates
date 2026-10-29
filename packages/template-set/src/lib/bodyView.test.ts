import { describe, expect, it } from "vitest";
import { bodyViewOf } from "./bodyView.js";

describe("bodyViewOf", () => {
  it("keeps a view name", () => {
    expect(bodyViewOf("molexProductCategoryBody")).toBe("molexProductCategoryBody");
    expect(bodyViewOf("my-body_2")).toBe("my-body_2");
  });

  it("refuses a path, a node type, a template selector or an overlong name", () => {
    expect(bodyViewOf("../hidden")).toBeUndefined();
    expect(bodyViewOf("jnt:page")).toBeUndefined();
    expect(bodyViewOf("body.html")).toBeUndefined();
    expect(bodyViewOf("2body")).toBeUndefined();
    expect(bodyViewOf("b".repeat(65))).toBeUndefined();
  });

  it("ignores what is not a string", () => {
    expect(bodyViewOf(undefined)).toBeUndefined();
    expect(bodyViewOf(null)).toBeUndefined();
    expect(bodyViewOf(42)).toBeUndefined();
    expect(bodyViewOf("")).toBeUndefined();
  });
});
