import { describe, expect, it } from "vitest";
import { keyResult, type KeyInput } from "./comboboxKeys.js";

const input = (patch: Partial<KeyInput>): KeyInput => ({
  key: "ArrowDown",
  open: true,
  active: -1,
  count: 3,
  fromInput: true,
  ...patch,
});

describe("keyResult (search combobox)", () => {
  it("ArrowDown opens a closed list, then moves down and wraps", () => {
    expect(keyResult(input({ open: false }))).toEqual({ prevent: true, open: true });
    expect(keyResult(input({ active: -1 }))).toEqual({ prevent: true, active: 0 });
    expect(keyResult(input({ active: 2 }))).toEqual({ prevent: true, active: 0 });
  });

  it("ArrowUp moves up and wraps to the last option", () => {
    expect(keyResult(input({ key: "ArrowUp", active: 1 }))).toEqual({ prevent: true, active: 0 });
    expect(keyResult(input({ key: "ArrowUp", active: 0 }))).toEqual({ prevent: true, active: 2 });
    expect(keyResult(input({ key: "ArrowUp", active: -1 }))).toEqual({ prevent: true, active: 2 });
  });

  it("does nothing for the arrows without options", () => {
    expect(keyResult(input({ count: 0 }))).toEqual({ prevent: false });
  });

  it("Enter on a highlighted option goes to it and cancels the form's submit", () => {
    expect(keyResult(input({ key: "Enter", active: 1 }))).toEqual({
      prevent: true,
      open: false,
      active: -1,
      pick: 1,
    });
  });

  it("Enter with no highlighted option, or a closed list, lets the form submit", () => {
    expect(keyResult(input({ key: "Enter", active: -1 }))).toEqual({
      prevent: false,
      open: false,
      active: -1,
    });
    expect(keyResult(input({ key: "Enter", open: false, active: 1 })).pick).toBeUndefined();
    expect(keyResult(input({ key: "Enter", active: 5 })).pick).toBeUndefined();
  });

  it("Escape closes the list, then the panel, then nothing", () => {
    expect(keyResult(input({ key: "Escape" }))).toEqual({ prevent: true, open: false, active: -1 });
    expect(keyResult(input({ key: "Escape", open: false, expanded: true }))).toEqual({
      prevent: true,
      collapse: true,
    });
    expect(keyResult(input({ key: "Escape", open: false }))).toEqual({ prevent: false });
  });

  it("ignores the other keys, and keys of other controls than the input (but Escape)", () => {
    expect(keyResult(input({ key: "a" }))).toEqual({ prevent: false });
    expect(keyResult(input({ key: "Enter", active: 0, fromInput: false }))).toEqual({
      prevent: false,
    });
    expect(keyResult(input({ key: "Escape", fromInput: false }))).toEqual({
      prevent: true,
      open: false,
      active: -1,
    });
  });
});
