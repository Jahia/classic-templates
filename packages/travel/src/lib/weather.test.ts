import { describe, expect, it } from "vitest";
import { WEATHER_EMOJI, WEATHER_KINDS, readWeather, weatherKind } from "./weather.js";

describe("weatherKind", () => {
  it("groups the WMO codes", () => {
    expect(weatherKind(0)).toBe("clear");
    expect(weatherKind(2)).toBe("partlyCloudy");
    expect(weatherKind(3)).toBe("overcast");
    expect(weatherKind(45)).toBe("fog");
    expect(weatherKind(53)).toBe("drizzle");
    expect(weatherKind(61)).toBe("rain");
    expect(weatherKind(66)).toBe("freezingRain");
    expect(weatherKind(75)).toBe("snow");
    expect(weatherKind(81)).toBe("rainShowers");
    expect(weatherKind(86)).toBe("snowShowers");
    expect(weatherKind(99)).toBe("thunderstorm");
  });

  it("calls a code outside the table unknown", () => {
    expect(weatherKind(4)).toBe("unknown");
    expect(weatherKind(-1)).toBe("unknown");
  });

  it("has an emoji for every kind", () => {
    for (const kind of WEATHER_KINDS) expect(WEATHER_EMOJI[kind]).toBeTruthy();
  });
});

describe("readWeather", () => {
  it("keeps the temperature and the code of an answer", () => {
    expect(readWeather({ tempC: 24, weatherCode: 0, condition: "Clear", cached: true })).toEqual({
      tempC: 24,
      weatherCode: 0,
    });
  });

  it("rejects an error or a malformed answer", () => {
    expect(readWeather({ error: "no-coordinates" })).toBeUndefined();
    expect(readWeather({ tempC: "24", weatherCode: 0 })).toBeUndefined();
    expect(readWeather({ tempC: 24, weatherCode: 1.5 })).toBeUndefined();
    expect(readWeather(null)).toBeUndefined();
  });
});
