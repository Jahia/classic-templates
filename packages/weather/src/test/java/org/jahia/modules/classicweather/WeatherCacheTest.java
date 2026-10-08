package org.jahia.modules.classicweather;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class WeatherCacheTest {

    /** A clock the test moves forward. */
    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-10-08T08:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }
    }

    private final MutableClock clock = new MutableClock();
    private final WeatherCache<String> cache = new WeatherCache<>(clock);

    @Test
    void returnsAValueUntilItExpires() {
        cache.put("tokyo", "Clear", Duration.ofMinutes(10));
        clock.advance(Duration.ofMinutes(9).plusSeconds(59));
        assertEquals(Optional.of("Clear"), cache.get("tokyo"));
        clock.advance(Duration.ofSeconds(1));
        assertTrue(cache.get("tokyo").isEmpty());
    }

    @Test
    void aZeroTtlStoresNothing() {
        cache.put("tokyo", "Clear", Duration.ZERO);
        assertTrue(cache.get("tokyo").isEmpty());
    }

    @Test
    void keysAreIndependent() {
        cache.put("tokyo", "Clear", Duration.ofMinutes(10));
        assertTrue(cache.get("lyon").isEmpty());
    }

    @Test
    void clearDropsEverything() {
        cache.put("tokyo", "Clear", Duration.ofMinutes(10));
        cache.clear();
        assertTrue(cache.get("tokyo").isEmpty());
    }
}
