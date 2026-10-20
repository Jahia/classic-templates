import { describe, expect, it } from "vitest";
import { isListedStatus } from "./moderation.js";

describe("isListedStatus", () => {
  it("lists an item that is not moderated", () => {
    expect(isListedStatus(undefined)).toBe(true);
  });

  it("lists an accepted item", () => {
    expect(isListedStatus("accepted")).toBe(true);
  });

  it("keeps submitted, in review and declined items out", () => {
    expect(isListedStatus("submitted")).toBe(false);
    expect(isListedStatus("inReview")).toBe(false);
    expect(isListedStatus("declined")).toBe(false);
  });

  it("keeps an unknown status out", () => {
    expect(isListedStatus("published")).toBe(false);
  });
});
