package org.jahia.modules.classicweather;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WeatherCodesTest {

    @ParameterizedTest
    @CsvSource({
            "0, Clear",
            "1, Partly cloudy", "2, Partly cloudy", "3, Partly cloudy",
            "45, Fog", "48, Fog",
            "51, Drizzle", "57, Drizzle",
            "61, Rain", "67, Rain",
            "71, Snow", "77, Snow",
            "80, Showers", "82, Showers",
            "85, Snow showers", "86, Snow showers",
            "95, Thunderstorm", "99, Thunderstorm",
            "4, Unknown", "100, Unknown", "-1, Unknown"
    })
    void mapsWmoCodeToLabel(int code, String label) {
        assertEquals(label, WeatherCodes.condition(code));
    }
}
