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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * {@code GET <node URL>.weather.do}: the current weather at the node's {@code latitude} and
 * {@code longitude}, from Open-Meteo, cached in memory per node.
 *
 * <pre>
 * 200 {"tempC":14,"condition":"Partly cloudy","weatherCode":2,"windKmh":9.4,
 *      "updatedAt":"2026-10-02T09:15:00Z","cached":false}
 * 404 {"error":"no-coordinates"}        the node has no latitude/longitude
 * 503 {"error":"upstream-unavailable"}  Open-Meteo is down or too slow
 * </pre>
 *
 * Open to anonymous visitors, on GET, so the browser can call it from a live page. The cache
 * TTL is {@value #DEFAULT_TTL_SECONDS} s, configurable with {@code cacheTtlSeconds} in the
 * OSGi configuration {@code org.jahia.modules.classicweather}.
 */
@Component(service = Action.class, configurationPid = "org.jahia.modules.classicweather")
public class WeatherAction extends Action {

    static final long DEFAULT_TTL_SECONDS = 600;
    private static final Logger logger = LoggerFactory.getLogger(WeatherAction.class);

    private final OpenMeteoClient openMeteo = new OpenMeteoClient(Clock.systemUTC());
    private WeatherCache cache;
    private long ttlSeconds;

    @Activate
    public void activate(Map<String, Object> config) {
        setName("weather");
        setRequireAuthenticatedUser(false);
        setRequiredMethods("GET");
        ttlSeconds = Long.parseLong(String.valueOf(config.getOrDefault("cacheTtlSeconds", DEFAULT_TTL_SECONDS)));
        cache = new WeatherCache(Duration.ofSeconds(ttlSeconds), Clock.systemUTC());
    }

    @Override
    public ActionResult doExecute(HttpServletRequest req, RenderContext renderContext, Resource resource,
                                  JCRSessionWrapper session, Map<String, List<String>> parameters,
                                  URLResolver urlResolver) throws Exception {
        HttpServletResponse resp = renderContext.getResponse();
        JCRNodeWrapper node = resource.getNode();
        if (!node.hasProperty("latitude") || !node.hasProperty("longitude")) {
            return send(resp, 404, "no-store", new JSONObject().put("error", "no-coordinates"));
        }
        double latitude = node.getProperty("latitude").getDouble();
        double longitude = node.getProperty("longitude").getDouble();

        WeatherCache.Result result;
        try {
            result = cache.get(node.getIdentifier(), () -> openMeteo.current(latitude, longitude));
        } catch (Exception e) {
            logger.warn("Open-Meteo call failed for {}: {}", node.getPath(), e.toString());
            return send(resp, 503, "no-store", new JSONObject().put("error", "upstream-unavailable"));
        }

        Weather weather = result.weather();
        JSONObject json = new JSONObject()
                .put("tempC", Math.round(weather.tempC()))
                .put("condition", WeatherCodes.condition(weather.weatherCode()))
                .put("weatherCode", weather.weatherCode())
                .put("windKmh", weather.windKmh())
                .put("updatedAt", weather.updatedAt().toString())
                .put("cached", result.cached());
        return send(resp, 200, "public, max-age=" + ttlSeconds, json);
    }

    /**
     * Writes the JSON body ourselves and returns {@code null}: Jahia then neither redirects nor
     * renders anything, whatever the request's {@code Accept} header.
     */
    private static ActionResult send(HttpServletResponse resp, int status, String cacheControl, JSONObject body)
            throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json;charset=UTF-8");
        resp.setHeader("Cache-Control", cacheControl);
        resp.getWriter().write(body.toString());
        return null;
    }
}
