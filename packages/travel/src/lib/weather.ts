/**
 * The weather chip of the destination mosaic: the answer of the classic-weather endpoint
 * (`<destination URL>.weather.do`), and what the chip shows for a WMO weather code. Pure functions,
 * unit-tested in weather.test.ts, and bundled in the browser island.
 */

/** The fields of the endpoint's answer that the chip reads. */
export interface WeatherAnswer {
  tempC: number;
  weatherCode: number;
}

/** The conditions the chip names, each a locale key under `weather.condition`. */
export const CONDITIONS = [
  "clear",
  "partlyCloudy",
  "fog",
  "drizzle",
  "rain",
  "snow",
  "showers",
  "snowShowers",
  "thunderstorm",
  "unknown",
] as const;

export type Condition = (typeof CONDITIONS)[number];

/** The condition of a WMO weather code (https://open-meteo.com/en/docs), the table of classic-weather. */
export const conditionOf = (code: number): Condition => {
  if (code === 0) return "clear";
  if (code >= 1 && code <= 3) return "partlyCloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "showers";
  if (code === 85 || code === 86) return "snowShowers";
  if (code >= 95 && code <= 99) return "thunderstorm";
  return "unknown";
};

const SYMBOLS: Record<Condition, string> = {
  clear: "☀️",
  partlyCloudy: "⛅",
  fog: "🌫️",
  drizzle: "🌦️",
  rain: "🌧️",
  snow: "❄️",
  showers: "🌦️",
  snowShowers: "🌨️",
  thunderstorm: "⛈️",
  unknown: "🌡️",
};

/** The emoji shown before the condition; screen readers skip it. */
export const symbolOf = (condition: Condition): string => SYMBOLS[condition];

/** The endpoint's answer when it has the two fields the chip reads, else null. */
export const readAnswer = (json: unknown): WeatherAnswer | null => {
  if (typeof json !== "object" || json === null) return null;
  const { tempC, weatherCode } = json as Record<string, unknown>;
  return typeof tempC === "number" && typeof weatherCode === "number"
    ? { tempC, weatherCode }
    : null;
};
