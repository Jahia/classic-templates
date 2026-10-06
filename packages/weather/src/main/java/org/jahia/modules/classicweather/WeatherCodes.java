package org.jahia.modules.classicweather;

/**
 * Turns a WMO weather interpretation code, as returned by Open-Meteo in {@code weather_code},
 * into the short label shown on the weather chip.
 *
 * @see <a href="https://open-meteo.com/en/docs">Open-Meteo, "WMO Weather interpretation codes"</a>
 */
public final class WeatherCodes {

    private WeatherCodes() {
    }

    /**
     * @param code a WMO weather code (0–99)
     * @return a label of one or two words, {@code "Unknown"} for a code outside the table
     */
    public static String condition(int code) {
        if (code == 0) return "Clear";
        if (code >= 1 && code <= 3) return "Partly cloudy";
        if (code == 45 || code == 48) return "Fog";
        if (code >= 51 && code <= 57) return "Drizzle";
        if (code >= 61 && code <= 67) return "Rain";
        if (code >= 71 && code <= 77) return "Snow";
        if (code >= 80 && code <= 82) return "Showers";
        if (code == 85 || code == 86) return "Snow showers";
        if (code >= 95 && code <= 99) return "Thunderstorm";
        return "Unknown";
    }
}
