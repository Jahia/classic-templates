import { useEffect, useRef, useState } from "react";
import {
  WEATHER_EMOJI,
  readWeather,
  weatherKind,
  type WeatherAnswer,
  type WeatherKind,
} from "../../../lib/weather.js";

export interface WeatherChipProps {
  /** `<destination URL>.weather.do`, the classic-weather action. */
  url: string;
  /** The name of each kind of weather, in the page's language. */
  labels: Record<WeatherKind, string>;
  /** Read by screen readers before the condition ("Weather now"). */
  prefix: string;
  /** Class names of the server stylesheet (mosaic.module.css), so the chip has no CSS of its own. */
  classes: { chip: string; emoji: string; condition: string; temp: string; visuallyHidden: string };
}

/**
 * The current weather of a mosaic card, loaded the first time the card is hovered or receives the
 * keyboard focus, never before: a page of mosaics costs no call until a visitor shows interest. A
 * failed call is retried on the next hover. The card's stylesheet shows the chip only while the
 * card is hovered or focused.
 */
export default function WeatherChip({ url, labels, prefix, classes }: WeatherChipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [weather, setWeather] = useState<WeatherAnswer>();

  useEffect(() => {
    const card = anchorRef.current?.closest("article");
    if (!card) return;
    const controller = new AbortController();
    let loading = false;
    let loaded = false;
    const load = () => {
      if (loading || loaded) return;
      loading = true;
      fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal })
        .then((response) => (response.ok ? response.json() : undefined))
        .then((body: unknown) => {
          const answer = readWeather(body);
          if (!answer) throw new Error("no weather");
          loaded = true;
          setWeather(answer);
        })
        .catch(() => {
          loading = false;
        });
    };
    card.addEventListener("pointerenter", load);
    card.addEventListener("focusin", load);
    return () => {
      card.removeEventListener("pointerenter", load);
      card.removeEventListener("focusin", load);
      controller.abort();
    };
  }, [url]);

  if (!weather) return <span ref={anchorRef} hidden />;
  const kind = weatherKind(weather.weatherCode);
  return (
    <p className={classes.chip} data-testid="ctrv-weather-chip">
      <span className={classes.visuallyHidden}>{prefix} </span>
      <span className={classes.emoji} aria-hidden="true">
        {WEATHER_EMOJI[kind]}
      </span>
      <span className={classes.condition}>{labels[kind]}</span>{" "}
      <span className={classes.temp}>{Math.round(weather.tempC)}°</span>
    </p>
  );
}
