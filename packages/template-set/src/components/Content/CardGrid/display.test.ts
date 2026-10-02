import { describe, expect, it } from "vitest";
import { childView, displayOf } from "./display.js";

describe("card grid display", () => {
  it("keeps the known displays and falls back to cards", () => {
    expect(displayOf("iconTiles")).toBe("iconTiles");
    expect(displayOf("logos")).toBe("logos");
    expect(displayOf("cards")).toBe("cards");
    expect(displayOf()).toBe("cards");
    expect(displayOf("")).toBe("cards");
    expect(displayOf("carousel")).toBe("cards");
    expect(displayOf("toString")).toBe("cards");
  });

  it("renders cards with the default view and the others with the view of their name", () => {
    expect(childView("cards")).toBeUndefined();
    expect(childView("iconTiles")).toBe("iconTiles");
    expect(childView("logos")).toBe("logos");
  });
});
