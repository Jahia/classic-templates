/**
 * The weather chip of the mosaic cards: the answer of the classic-weather action
 * (`<destination URL>.weather.do`), the kind of weather a WMO code stands for, and its emoji. Pure
 * (no Jahia import), so the server view and the client chip share it and it is unit tested. The
 * kinds are named in the page's language by the locales (weather.kind.*), never by the action's
 * English label.
 */

/** What the classic-weather action answers (only the fields the chip reads). */
export interface WeatherAnswer {
  tempC: number;
  weatherCode: number;
}

export const WEATHER_KINDS = [
  "clear",
  "partlyCloudy",
  "overcast",
  "fog",
  "drizzle",
  "rain",
  "freezingRain",
  "snow",
  "rainShowers",
  "snowShowers",
  "thunderstorm",
  "unknown",
] as const;

export type WeatherKind = (typeof WEATHER_KINDS)[number];

/** The kind of weather of a WMO weather interpretation code, as Open-Meteo sends it. */
export const weatherKind = (code: number): WeatherKind => {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partlyCloudy";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if (code === 51 || code === 53 || code === 55) return "drizzle";
  if (code === 61 || code === 63 || code === 65) return "rain";
  if (code === 56 || code === 57 || code === 66 || code === 67) return "freezingRain";
  if (code === 71 || code === 73 || code === 75 || code === 77) return "snow";
  if (code === 80 || code === 81 || code === 82) return "rainShowers";
  if (code === 85 || code === 86) return "snowShowers";
  if (code === 95 || code === 96 || code === 99) return "thunderstorm";
  return "unknown";
};

/** The emoji shown before the condition; decorative, the condition is written next to it. */
export const WEATHER_EMOJI: Record<WeatherKind, string> = {
  clear: "☀️",
  partlyCloudy: "⛅",
  overcast: "☁️",
  fog: "🌫️",
  drizzle: "🌦️",
  rain: "🌧️",
  freezingRain: "🧊",
  snow: "❄️",
  rainShowers: "🌦️",
  snowShowers: "🌨️",
  thunderstorm: "⛈️",
  unknown: "🌡️",
};

/** The answer when it has the fields the chip shows; undefined for an error or anything else. */
export const readWeather = (body: unknown): WeatherAnswer | undefined => {
  if (typeof body !== "object" || body === null) return undefined;
  const { tempC, weatherCode } = body as Record<string, unknown>;
  if (typeof tempC !== "number" || !Number.isFinite(tempC)) return undefined;
  if (typeof weatherCode !== "number" || !Number.isInteger(weatherCode)) return undefined;
  return { tempC, weatherCode };
};
