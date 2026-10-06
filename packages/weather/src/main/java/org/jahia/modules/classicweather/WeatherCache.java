package org.jahia.modules.classicweather;

import java.time.Clock;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;

/**
 * An in-memory cache of {@link Weather} values, one per key, that expire {@code ttl} after they
 * were fetched. Failures are never cached: if the loader throws, the next call tries again.
 *
 * <p>Two concurrent misses on the same key may both call the loader; for a weather chip this
 * is harmless and keeps the code free of locks held during a network call.
 */
public final class WeatherCache {

    /** A cache answer: the value, and whether it came from the cache or from the loader. */
    public record Result(Weather weather, boolean cached) {
    }

    private final Map<String, Weather> entries = new ConcurrentHashMap<>();
    private final Duration ttl;
    private final Clock clock;

    public WeatherCache(Duration ttl, Clock clock) {
        this.ttl = ttl;
        this.clock = clock;
    }

    /**
     * Returns the cached value for {@code key} if it is younger than the TTL, otherwise calls
     * {@code loader} and caches its value.
     *
     * @throws Exception whatever the loader throws; nothing is cached in that case
     */
    public Result get(String key, Callable<Weather> loader) throws Exception {
        Weather hit = entries.get(key);
        if (hit != null && clock.instant().isBefore(hit.updatedAt().plus(ttl))) {
            return new Result(hit, true);
        }
        Weather fresh = loader.call();
        entries.put(key, fresh);
        return new Result(fresh, false);
    }
}
