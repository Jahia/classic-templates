import { describe, expect, it } from "vitest";
import { keyResult, type KeyInput } from "./headerSearch.js";

const input = (patch: Partial<KeyInput>): KeyInput => ({
  key: "ArrowDown",
  open: true,
  focus: -1,
  count: 3,
  ...patch,
});

describe("keyResult (header search box)", () => {
  it("ArrowDown opens a closed list, then moves the focus onto the links and wraps", () => {
    expect(keyResult(input({ open: false }))).toEqual({ prevent: true, open: true });
    expect(keyResult(input({ focus: -1 }))).toEqual({ prevent: true, focus: 0 });
    expect(keyResult(input({ focus: 1 }))).toEqual({ prevent: true, focus: 2 });
    expect(keyResult(input({ focus: 2 }))).toEqual({ prevent: true, focus: 0 });
  });

  it("ArrowUp goes from the input to the last link, and from the first link back to the input", () => {
    expect(keyResult(input({ key: "ArrowUp", focus: -1 }))).toEqual({ prevent: true, focus: 2 });
    expect(keyResult(input({ key: "ArrowUp", focus: 0 }))).toEqual({ prevent: true, focus: -1 });
    expect(keyResult(input({ key: "ArrowUp", focus: 2 }))).toEqual({ prevent: true, focus: 1 });
  });

  it("leaves the arrows alone when there is nothing to suggest", () => {
    expect(keyResult(input({ count: 0 }))).toEqual({ prevent: false });
    expect(keyResult(input({ key: "ArrowUp", count: 0, open: false }))).toEqual({ prevent: false });
  });

  it("Escape on a link returns to the input and closes the list", () => {
    expect(keyResult(input({ key: "Escape", focus: 1 }))).toEqual({
      prevent: true,
      open: false,
      focus: -1,
    });
  });

  it("Escape in the input closes the list, then the panel", () => {
    expect(keyResult(input({ key: "Escape" }))).toEqual({ prevent: true, open: false });
    expect(keyResult(input({ key: "Escape", open: false, expanded: true }))).toEqual({
      prevent: true,
      collapse: true,
    });
    expect(keyResult(input({ key: "Escape", open: false }))).toEqual({ prevent: false });
  });

  it("leaves Enter and the other keys to the browser (a link follows, the form submits)", () => {
    expect(keyResult(input({ key: "Enter", focus: 1 }))).toEqual({ prevent: false });
    expect(keyResult(input({ key: "Enter" }))).toEqual({ prevent: false });
    expect(keyResult(input({ key: "a" }))).toEqual({ prevent: false });
  });
});
