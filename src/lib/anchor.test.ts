import { describe, expect, it } from "vitest";
import { anchorOf } from "./anchor.js";

describe("anchorOf", () => {
  it("keeps a Jahia node name as it is", () => {
    expect(anchorOf("acc-", "baggage-allowance")).toBe("acc-baggage-allowance");
  });

  it("lower-cases, drops accents and joins words with one hyphen", () => {
    expect(anchorOf("acc-", "Où est mon_Bagage ? (2)")).toBe("acc-ou-est-mon-bagage-2");
    expect(anchorOf("acc-", "--a--b--")).toBe("acc-a-b");
  });

  it("never returns an empty or overlong anchor", () => {
    expect(anchorOf("acc-", "???")).toBe("acc-item");
    expect(anchorOf("acc-", "x".repeat(200))).toHaveLength(4 + 64);
  });
});
