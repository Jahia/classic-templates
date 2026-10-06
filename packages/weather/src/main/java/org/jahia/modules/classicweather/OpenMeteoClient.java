package org.jahia.modules.classicweather;

import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Duration;
import java.util.Locale;

/**
 * Calls the Open-Meteo forecast API (free, no API key) for the current weather at a point.
 *
 * @see <a href="https://open-meteo.com/en/docs">Open-Meteo API documentation</a>
 */
public final class OpenMeteoClient {

    private static final String URL = "https://api.open-meteo.com/v1/forecast"
            + "?latitude=%s&longitude=%s&current=temperature_2m,weather_code,wind_speed_10m";

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private final Clock clock;

    public OpenMeteoClient(Clock clock) {
        this.clock = clock;
    }

    /**
     * @return the current weather at ({@code latitude}, {@code longitude})
     * @throws IOException if Open-Meteo is unreachable, too slow (5 s) or answers an error
     */
    public Weather current(double latitude, double longitude) throws IOException, InterruptedException {
        URI uri = URI.create(String.format(Locale.ROOT, URL, latitude, longitude));
        HttpRequest request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(5)).GET().build();
        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IOException("Open-Meteo answered HTTP " + response.statusCode());
        }
        JSONObject current = new JSONObject(response.body()).getJSONObject("current");
        return new Weather(
                current.getDouble("temperature_2m"),
                current.getInt("weather_code"),
                current.getDouble("wind_speed_10m"),
                clock.instant());
    }
}
