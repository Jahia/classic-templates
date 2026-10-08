package org.jahia.modules.classicweather;

/**
 * WMO weather interpretation codes, as Open-Meteo sends them in {@code weather_code}, to a short
 * English label. Pages name the condition from the code in their own language; this label is for
 * the JSON reader and the logs.
 */
public final class WeatherCodes {

    private WeatherCodes() {
    }

    /** The label of a WMO code; "Unknown" for a code outside the table. */
    public static String label(int code) {
        return switch (code) {
            case 0 -> "Clear";
            case 1, 2 -> "Partly cloudy";
            case 3 -> "Overcast";
            case 45, 48 -> "Fog";
            case 51, 53, 55 -> "Drizzle";
            case 56, 57 -> "Freezing drizzle";
            case 61, 63, 65 -> "Rain";
            case 66, 67 -> "Freezing rain";
            case 71, 73, 75, 77 -> "Snow";
            case 80, 81, 82 -> "Rain showers";
            case 85, 86 -> "Snow showers";
            case 95 -> "Thunderstorm";
            case 96, 99 -> "Thunderstorm with hail";
            default -> "Unknown";
        };
    }
}
