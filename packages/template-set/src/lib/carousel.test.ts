import { describe, expect, it } from "vitest";
import source from "../../static/js/carousel.js?raw";
import { CAROUSEL_DEFAULT_INTERVAL, carouselInterval } from "./carousel.js";

interface CarouselScript {
  wrapIndex(i: number, count: number): number;
  keyTarget(key: string, current: number, count: number): number;
  delayOf(value: unknown): number;
}

/**
 * The pure helpers of static/js/carousel.js: the script runs in a sandbox without a document,
 * where it only hands them to `module.exports`. node:vm is loaded by name because the module's
 * TypeScript setup has no Node typings (tests run in Node, views do not).
 */
const loadScript = async (): Promise<CarouselScript> => {
  const vmModule = "node:vm";
  const vm = (await import(/* @vite-ignore */ vmModule)) as {
    runInNewContext(code: string, context: object): unknown;
  };
  const sandbox = { module: { exports: {} } };
  vm.runInNewContext(source, sandbox);
  return sandbox.module.exports as CarouselScript;
};
const script = await loadScript();

describe("carouselInterval", () => {
  it("defaults to 7 seconds when the value is missing or not a number", () => {
    for (const value of [undefined, null, "", "slow", Number.NaN, 0]) {
      expect(carouselInterval(value)).toBe(CAROUSEL_DEFAULT_INTERVAL);
    }
  });

  it("never goes under 5 seconds nor over 30, rounded", () => {
    expect(carouselInterval(1)).toBe(5);
    expect(carouselInterval(-10)).toBe(5);
    expect(carouselInterval(5)).toBe(5);
    expect(carouselInterval("12")).toBe(12);
    expect(carouselInterval(8.4)).toBe(8);
    expect(carouselInterval(30)).toBe(30);
    expect(carouselInterval(3600)).toBe(30);
  });
});

describe("carousel script: slide index math", () => {
  it("wraps around in both directions", () => {
    expect(script.wrapIndex(0, 4)).toBe(0);
    expect(script.wrapIndex(4, 4)).toBe(0);
    expect(script.wrapIndex(5, 4)).toBe(1);
    expect(script.wrapIndex(-1, 4)).toBe(3);
    expect(script.wrapIndex(-5, 4)).toBe(3);
  });

  it("moves between slide buttons with the arrow keys, Home and End", () => {
    expect(script.keyTarget("ArrowRight", 0, 3)).toBe(1);
    expect(script.keyTarget("ArrowRight", 2, 3)).toBe(0);
    expect(script.keyTarget("ArrowLeft", 0, 3)).toBe(2);
    expect(script.keyTarget("Home", 2, 3)).toBe(0);
    expect(script.keyTarget("End", 0, 3)).toBe(2);
    expect(script.keyTarget("Enter", 1, 3)).toBe(-1);
    expect(script.keyTarget("a", 1, 3)).toBe(-1);
  });

  it("never advances faster than every 5 seconds", () => {
    expect(script.delayOf("7")).toBe(7000);
    expect(script.delayOf("2")).toBe(5000);
    expect(script.delayOf(null)).toBe(7000);
    expect(script.delayOf("soon")).toBe(7000);
    expect(script.delayOf("-3")).toBe(7000);
  });
});
