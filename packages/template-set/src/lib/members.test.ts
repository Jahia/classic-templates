import { describe, expect, it } from "vitest";
import { gateFor, nearestFlagged } from "./members.js";

describe("gateFor", () => {
  it("opens an item that is not flagged, whoever asks", () => {
    expect(gateFor({ membersOnly: false, signedIn: false, editMode: false })).toBe("open");
  });

  it("holds a flagged item back from a visitor who is not signed in", () => {
    expect(gateFor({ membersOnly: true, signedIn: false, editMode: false })).toBe("teaser");
  });

  it("opens a flagged item for a signed-in visitor", () => {
    expect(gateFor({ membersOnly: true, signedIn: true, editMode: false })).toBe("open");
  });

  it("opens a flagged item in edit mode, so editors can edit it", () => {
    expect(gateFor({ membersOnly: true, signedIn: false, editMode: true })).toBe("open");
  });
});

describe("nearestFlagged", () => {
  // home > members (flagged) > members/news > members/news/item
  const parents: Record<string, string | undefined> = {
    "members/news/item": "members/news",
    "members/news": "members",
    "members": "home",
    "home": undefined,
  };
  const parent = (n: string) => parents[n];

  it("finds the page itself when it is flagged", () => {
    expect(nearestFlagged("members", (n) => n === "members", parent)).toBe("members");
  });

  it("finds a flagged ancestor: sub-pages inherit the gate", () => {
    expect(nearestFlagged("members/news/item", (n) => n === "members", parent)).toBe("members");
  });

  it("finds nothing when no page up the tree is flagged", () => {
    expect(nearestFlagged("members/news/item", () => false, parent)).toBeUndefined();
  });

  it("visits every node looked at, the found one included, and none above it", () => {
    const visited: string[] = [];
    nearestFlagged(
      "members/news/item",
      (n) => n === "members",
      parent,
      (n) => visited.push(n),
    );
    expect(visited).toEqual(["members/news/item", "members/news", "members"]);
  });

  it("stops on a cycle instead of looping", () => {
    expect(
      nearestFlagged(
        "a",
        () => false,
        (n) => (n === "a" ? "b" : "a"),
      ),
    ).toBeUndefined();
  });
});
