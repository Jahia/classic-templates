package org.jahia.modules.classicweather;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class WeatherCacheTest {

    private static final Instant T0 = Instant.parse("2026-10-02T09:00:00Z");

    /** A clock the test moves by hand. */
    private static final class TestClock extends Clock {
        Instant now = T0;
        @Override public Instant instant() { return now; }
        @Override public ZoneOffset getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
    }

    private final TestClock clock = new TestClock();
    private final WeatherCache cache = new WeatherCache(Duration.ofMinutes(10), clock);
    private final AtomicInteger upstreamCalls = new AtomicInteger();

    private Weather fetch() {
        upstreamCalls.incrementAndGet();
        return new Weather(14.2, 2, 9.4, clock.instant());
    }

    @Test
    void secondCallWithinTtlIsServedFromCache() throws Exception {
        assertFalse(cache.get("lyon", this::fetch).cached());
        clock.now = T0.plus(Duration.ofMinutes(9));
        WeatherCache.Result second = cache.get("lyon", this::fetch);

        assertTrue(second.cached());
        assertEquals(T0, second.weather().updatedAt());
        assertEquals(1, upstreamCalls.get());
    }

    @Test
    void callAfterTtlFetchesAgain() throws Exception {
        cache.get("lyon", this::fetch);
        clock.now = T0.plus(Duration.ofMinutes(10));
        WeatherCache.Result later = cache.get("lyon", this::fetch);

        assertFalse(later.cached());
        assertEquals(clock.now, later.weather().updatedAt());
        assertEquals(2, upstreamCalls.get());
    }

    @Test
    void keysAreCachedSeparately() throws Exception {
        cache.get("lyon", this::fetch);
        assertFalse(cache.get("lisbon", this::fetch).cached());
        assertEquals(2, upstreamCalls.get());
    }

    @Test
    void failuresAreNotCached() throws Exception {
        assertThrows(IOException.class, () -> cache.get("lyon", () -> { throw new IOException("down"); }));
        assertFalse(cache.get("lyon", this::fetch).cached());
        assertEquals(1, upstreamCalls.get());
    }
}
