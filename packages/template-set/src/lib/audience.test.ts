import { describe, expect, it } from "vitest";
import { audienceOf, showsTo } from "./audience.js";

describe("audienceOf", () => {
  it("keeps the two limited audiences", () => {
    expect(audienceOf("guests")).toBe("guests");
    expect(audienceOf("members")).toBe("members");
  });

  it("reads anything else as everyone", () => {
    expect(audienceOf(undefined)).toBe("everyone");
    expect(audienceOf("everyone")).toBe("everyone");
    expect(audienceOf("staff")).toBe("everyone");
  });
});

describe("showsTo", () => {
  it("shows a button for everyone to both", () => {
    expect(showsTo("everyone", false)).toBe(true);
    expect(showsTo("everyone", true)).toBe(true);
  });

  it("shows a guests-only button to visitors who are not signed in only", () => {
    expect(showsTo("guests", false)).toBe(true);
    expect(showsTo("guests", true)).toBe(false);
  });

  it("shows a members-only button to signed-in visitors only", () => {
    expect(showsTo("members", true)).toBe(true);
    expect(showsTo("members", false)).toBe(false);
  });
});
