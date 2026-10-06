import { useEffect, useRef, useState } from "react";
import { conditionOf, readAnswer, symbolOf, type WeatherAnswer } from "../../../lib/weather.js";
import classes from "./mosaic.module.css";

/**
 * The live weather of a destination, fetched in the browser from the classic-weather endpoint
 * (never from Open-Meteo directly) the first time its card is hovered or focused, so a visitor who
 * never points at a card costs no call. Shows nothing until the answer arrives, or when the
 * endpoint fails or is not installed.
 */
export default function WeatherChip({
  url,
  label,
  conditions,
}: {
  url: string;
  label: string;
  conditions: Record<string, string>;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  // Touch screens have no hover and always show the chip (see the CSS): load at once.
  const [wanted, setWanted] = useState(() => matchMedia("(hover: none)").matches);
  const [weather, setWeather] = useState<WeatherAnswer | null>(null);

  useEffect(() => {
    if (wanted) return;
    const card = anchorRef.current?.closest("article");
    if (!card) return;
    const load = () => setWanted(true);
    card.addEventListener("pointerenter", load, { once: true });
    card.addEventListener("focusin", load, { once: true });
    return () => {
      card.removeEventListener("pointerenter", load);
      card.removeEventListener("focusin", load);
    };
  }, [wanted]);

  useEffect(() => {
    if (!wanted) return;
    const controller = new AbortController();
    fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // Jahia's CSRF guard refuses a .do call from a logged-in user without a token: the call is
      // anonymous, so editors see the chip too.
      credentials: "omit",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((json: unknown) => setWeather(readAnswer(json)))
      .catch(() => setWeather(null));
    return () => controller.abort();
  }, [wanted, url]);

  if (!weather) return <span ref={anchorRef} hidden />;
  const condition = conditionOf(weather.weatherCode);
  return (
    <p className={classes.chip}>
      <span className={classes.visuallyHidden}>{label} </span>
      <span aria-hidden="true">{symbolOf(condition)}</span> {conditions[condition]}{" "}
      <strong>{Math.round(weather.tempC)}°</strong>
    </p>
  );
}
