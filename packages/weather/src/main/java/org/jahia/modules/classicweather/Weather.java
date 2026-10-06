package org.jahia.modules.classicweather;

import java.time.Instant;

/**
 * The current weather at one place, as fetched from Open-Meteo.
 *
 * @param tempC       air temperature at 2 m, in °C
 * @param weatherCode WMO weather code, see {@link WeatherCodes}
 * @param windKmh     wind speed at 10 m, in km/h
 * @param updatedAt   when this value was fetched from Open-Meteo
 */
public record Weather(double tempC, int weatherCode, double windKmh, Instant updatedAt) {
}
