package org.jahia.modules.classicweather;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.time.Instant;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OpenMeteoClientTest {

    @Test
    void readsTheCurrentBlock() throws IOException {
        String body = "{\"current\":{\"time\":\"2026-10-08T08:00\",\"temperature_2m\":23.6,"
                + "\"weather_code\":0,\"wind_speed_10m\":12.34}}";
        OpenMeteoClient.Weather weather = OpenMeteoClient.parse(body, Instant.parse("2026-10-08T08:01:02.345Z"));
        assertEquals(24, weather.tempC());
        assertEquals(0, weather.weatherCode());
        assertEquals("Clear", weather.condition());
        assertEquals(12.3, weather.windKmh());
        assertEquals(Instant.parse("2026-10-08T08:01:02Z"), weather.updatedAt());
    }

    @Test
    void anUnexpectedAnswerIsAnIoError() {
        assertThrows(IOException.class, () -> OpenMeteoClient.parse("{\"error\":true}", Instant.now()));
    }

    @Test
    void writesCoordinatesWithADotWhateverTheLocale() {
        Locale before = Locale.getDefault();
        try {
            Locale.setDefault(Locale.FRANCE);
            String uri = OpenMeteoClient.uri(45.7675, 4.8345).toString();
            assertTrue(uri.contains("latitude=45.7675&longitude=4.8345"), uri);
        } finally {
            Locale.setDefault(before);
        }
    }
}
