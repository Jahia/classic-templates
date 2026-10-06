import { describe, expect, it } from "vitest";
import { CONDITIONS, conditionOf, readAnswer, symbolOf } from "./weather.js";

describe("conditionOf", () => {
  it.each([
    [0, "clear"],
    [1, "partlyCloudy"],
    [3, "partlyCloudy"],
    [45, "fog"],
    [48, "fog"],
    [51, "drizzle"],
    [57, "drizzle"],
    [61, "rain"],
    [67, "rain"],
    [71, "snow"],
    [77, "snow"],
    [80, "showers"],
    [82, "showers"],
    [85, "snowShowers"],
    [86, "snowShowers"],
    [95, "thunderstorm"],
    [99, "thunderstorm"],
    [4, "unknown"],
    [100, "unknown"],
    [-1, "unknown"],
  ])("maps the WMO code %i to %s", (code, condition) => {
    expect(conditionOf(code)).toBe(condition);
  });
});

describe("symbolOf", () => {
  it("has a symbol for every condition", () => {
    for (const condition of CONDITIONS) expect(symbolOf(condition)).toBeTruthy();
  });
});

describe("readAnswer", () => {
  it("keeps the temperature and the code", () => {
    expect(
      readAnswer({ tempC: 24, weatherCode: 2, condition: "Partly cloudy", cached: true }),
    ).toEqual({
      tempC: 24,
      weatherCode: 2,
    });
  });

  it("refuses an error answer or anything else", () => {
    expect(readAnswer({ error: "no-coordinates" })).toBeNull();
    expect(readAnswer(null)).toBeNull();
    expect(readAnswer("24")).toBeNull();
  });
});
