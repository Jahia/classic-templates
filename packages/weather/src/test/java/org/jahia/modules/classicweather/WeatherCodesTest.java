package org.jahia.modules.classicweather;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WeatherCodesTest {

    @Test
    void namesTheCommonCodes() {
        assertEquals("Clear", WeatherCodes.label(0));
        assertEquals("Partly cloudy", WeatherCodes.label(1));
        assertEquals("Partly cloudy", WeatherCodes.label(2));
        assertEquals("Overcast", WeatherCodes.label(3));
        assertEquals("Fog", WeatherCodes.label(48));
        assertEquals("Rain", WeatherCodes.label(63));
        assertEquals("Snow", WeatherCodes.label(75));
        assertEquals("Rain showers", WeatherCodes.label(81));
        assertEquals("Thunderstorm with hail", WeatherCodes.label(99));
    }

    @Test
    void anUnknownCodeIsUnknown() {
        assertEquals("Unknown", WeatherCodes.label(4));
        assertEquals("Unknown", WeatherCodes.label(-1));
    }
}
