package org.jahia.modules.classicweather;

import org.jahia.bin.Action;
import org.jahia.bin.ActionResult;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.URLResolver;
import org.json.JSONObject;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * {@code GET <node URL>.weather.do}: the current weather at the {@code latitude} and
 * {@code longitude} of the node (a classic-travel destination), as JSON. Open to guests, GET only,
 * read-only (whitelisted from the CSRF guard). Answers are cached per node for
 * {@code cacheTtlSeconds} (configuration {@code org.jahia.modules.classicweather}, 600 by default).
 */
@Component(service = Action.class, configurationPid = "org.jahia.modules.classicweather")
public class WeatherAction extends Action {

    private static final Logger logger = LoggerFactory.getLogger(WeatherAction.class);
    private static final long DEFAULT_TTL_SECONDS = 600;

    private final WeatherCache<OpenMeteoClient.Weather> cache = new WeatherCache<>(Clock.systemUTC());
    private final OpenMeteoClient client = new OpenMeteoClient(Clock.systemUTC());
    private volatile Duration ttl = Duration.ofSeconds(DEFAULT_TTL_SECONDS);

    @Activate
    @Modified
    public void activate(Map<String, Object> config) {
        setName("weather");
        setRequireAuthenticatedUser(false);
        setRequiredMethods("GET");
        ttl = Duration.ofSeconds(readTtl(config));
        cache.clear();
    }

    /** cacheTtlSeconds from the configuration; the default when absent, not a number, or negative. */
    static long readTtl(Map<String, Object> config) {
        Object value = config == null ? null : config.get("cacheTtlSeconds");
        if (value == null) {
            return DEFAULT_TTL_SECONDS;
        }
        try {
            long seconds = Long.parseLong(String.valueOf(value).trim());
            return seconds >= 0 ? seconds : DEFAULT_TTL_SECONDS;
        } catch (NumberFormatException e) {
            logger.warn("cacheTtlSeconds is not a number ({}): {} s used", value, DEFAULT_TTL_SECONDS);
            return DEFAULT_TTL_SECONDS;
        }
    }

    @Override
    public ActionResult doExecute(HttpServletRequest req, RenderContext renderContext, Resource resource,
                                  JCRSessionWrapper session, Map<String, List<String>> parameters,
                                  URLResolver urlResolver) throws Exception {
        HttpServletResponse resp = renderContext.getResponse();
        JCRNodeWrapper node = resource.getNode();
        Optional<double[]> point = coordinates(node);
        if (point.isEmpty()) {
            return send(resp, 404, new JSONObject().put("error", "no-coordinates"), null);
        }
        double latitude = point.get()[0];
        double longitude = point.get()[1];
        // The coordinates are part of the key: moving a destination never shows the old place's weather.
        String key = String.format(Locale.ROOT, "%s@%.4f,%.4f", node.getIdentifier(), latitude, longitude);
        Duration currentTtl = ttl;
        Optional<OpenMeteoClient.Weather> cached = cache.get(key);
        if (cached.isPresent()) {
            return send(resp, 200, toJson(cached.get(), true), currentTtl);
        }
        try {
            OpenMeteoClient.Weather weather = client.current(latitude, longitude);
            cache.put(key, weather, currentTtl);
            return send(resp, 200, toJson(weather, false), currentTtl);
        } catch (IOException e) {
            logger.warn("Weather unavailable for {}: {}", node.getPath(), e.getMessage());
            return send(resp, 503, new JSONObject().put("error", "upstream-unavailable"), null);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return send(resp, 503, new JSONObject().put("error", "upstream-unavailable"), null);
        }
    }

    /** latitude and longitude of the node, when both are set and in range. */
    private static Optional<double[]> coordinates(JCRNodeWrapper node) throws RepositoryException {
        if (!node.hasProperty("latitude") || !node.hasProperty("longitude")) {
            return Optional.empty();
        }
        double latitude = node.getProperty("latitude").getDouble();
        double longitude = node.getProperty("longitude").getDouble();
        if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
            return Optional.empty();
        }
        return Optional.of(new double[] {latitude, longitude});
    }

    private static JSONObject toJson(OpenMeteoClient.Weather weather, boolean cached) {
        return new JSONObject()
                .put("tempC", weather.tempC())
                .put("condition", weather.condition())
                .put("weatherCode", weather.weatherCode())
                .put("windKmh", weather.windKmh())
                .put("updatedAt", weather.updatedAt().toString())
                .put("cached", cached);
    }

    /**
     * Writes the JSON body and returns null, so Jahia neither redirects nor renders anything. A
     * success is cacheable for the TTL; an error is never cached.
     */
    private static ActionResult send(HttpServletResponse resp, int status, JSONObject body, Duration maxAge)
            throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json;charset=UTF-8");
        resp.setHeader("Cache-Control", maxAge == null || maxAge.isZero()
                ? "no-store"
                : "public, max-age=" + maxAge.toSeconds());
        resp.getWriter().write(body.toString());
        return null;
    }
}
