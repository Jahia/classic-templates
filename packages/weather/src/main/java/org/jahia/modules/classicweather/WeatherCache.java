package org.jahia.modules.classicweather;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * An in-memory cache with a time to live, shared by all requests. No lock is held while the value
 * is computed: two concurrent misses on the same key both call the upstream, and the last one
 * wins. Expired entries are dropped when they are read, and the map is swept when it grows.
 */
public final class WeatherCache<V> {

    /** Above this size, a put first drops every expired entry. */
    private static final int SWEEP_ABOVE = 1000;

    private record Entry<V>(V value, Instant expires) {
    }

    private final Map<String, Entry<V>> entries = new ConcurrentHashMap<>();
    private final Clock clock;

    public WeatherCache(Clock clock) {
        this.clock = clock;
    }

    /** The value stored under {@code key}, if it has not expired. */
    public Optional<V> get(String key) {
        Entry<V> entry = entries.get(key);
        if (entry == null) {
            return Optional.empty();
        }
        if (!clock.instant().isBefore(entry.expires())) {
            entries.remove(key, entry);
            return Optional.empty();
        }
        return Optional.of(entry.value());
    }

    /** Stores {@code value} under {@code key} for {@code ttl}; a zero or negative ttl stores nothing. */
    public void put(String key, V value, Duration ttl) {
        if (ttl.isZero() || ttl.isNegative()) {
            return;
        }
        Instant now = clock.instant();
        if (entries.size() > SWEEP_ABOVE) {
            entries.values().removeIf(entry -> !now.isBefore(entry.expires()));
        }
        entries.put(key, new Entry<>(value, now.plus(ttl)));
    }

    /** Drops every entry (the TTL changed). */
    public void clear() {
        entries.clear();
    }
}
