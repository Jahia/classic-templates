package org.jahia.modules.classicweather;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

/** One call to the Open-Meteo forecast API (free, no API key) for the current weather at a point. */
public class OpenMeteoClient {

    /** The current weather at a point, as the action sends it. */
    public record Weather(int tempC, int weatherCode, double windKmh, Instant updatedAt) {

        public String condition() {
            return WeatherCodes.label(weatherCode);
        }
    }

    private static final String ENDPOINT = "https://api.open-meteo.com/v1/forecast";
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(5);

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(CONNECT_TIMEOUT).build();
    private final Clock clock;

    public OpenMeteoClient(Clock clock) {
        this.clock = clock;
    }

    /** The current weather at {@code latitude}, {@code longitude}; throws when Open-Meteo fails. */
    public Weather current(double latitude, double longitude) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(uri(latitude, longitude))
                .timeout(READ_TIMEOUT)
                .header("Accept", "application/json")
                .GET()
                .build();
        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IOException("Open-Meteo answered HTTP " + response.statusCode());
        }
        return parse(response.body(), clock.instant());
    }

    /** The request URI; numbers are written with a dot whatever the server's locale. */
    static URI uri(double latitude, double longitude) {
        return URI.create(String.format(Locale.ROOT,
                "%s?latitude=%.4f&longitude=%.4f&current=temperature_2m,weather_code,wind_speed_10m"
                        + "&wind_speed_unit=kmh&temperature_unit=celsius",
                ENDPOINT, latitude, longitude));
    }

    /** Reads the {@code current} block of an Open-Meteo answer. */
    static Weather parse(String body, Instant now) throws IOException {
        try {
            JSONObject current = new JSONObject(body).getJSONObject("current");
            return new Weather(
                    (int) Math.round(current.getDouble("temperature_2m")),
                    current.getInt("weather_code"),
                    Math.round(current.getDouble("wind_speed_10m") * 10) / 10.0,
                    now.truncatedTo(ChronoUnit.SECONDS));
        } catch (JSONException e) {
            throw new IOException("Unexpected Open-Meteo answer", e);
        }
    }
}
