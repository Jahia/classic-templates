# classic-weather

The **classic-weather** module (`org.jahia.modules.javascript:classic-weather`), one of the four
packages of this repository, released at the same version as the template set. Back to the
[repository README](../../README.md).

A Jahia Java module with one action, `weather`. Call it on a node that has `latitude` and
`longitude` properties, such as a [classic-travel](../travel/README.md) destination, and it returns
the current weather there, from [Open-Meteo](https://open-meteo.com/) (free, no API key). The
destination mosaic of classic-travel calls it from the browser to show the weather chip of each
card.

```
GET <node URL>.weather.do

200 {"tempC":21,"condition":"Partly cloudy","weatherCode":1,"windKmh":8.6,"updatedAt":"2026-10-06T11:29:09Z","cached":false}
404 {"error":"no-coordinates"}         the node has no latitude or longitude
503 {"error":"upstream-unavailable"}   Open-Meteo is down or too slow (3 s connect, 5 s read)
```

- Anonymous visitors can call it, with GET.
- Answers are cached in memory per node for 10 minutes, and sent with
  `Cache-Control: public, max-age=600`. Failures are not cached.
- `condition` is an English label. classic-travel names the condition from `weatherCode` in the
  language of the page.

## Requirements

Jahia 8.2.1 or later. The module calls `https://api.open-meteo.com`: the Jahia server needs outbound
HTTPS to it.

## Installation

Download `classic-weather-<version>.jar` from the
[GitHub releases](https://github.com/Jahia/classic-templates/releases) and install it in Jahia
(Administration > Modules, or the provisioning API). It needs no site setting: the action answers on
every site.

## Configuration

To change the cache duration, create `org.jahia.modules.classicweather.cfg` in `karaf/etc` of the
Jahia server:

```
cacheTtlSeconds = 60
```

## Development

JDK 17 and Maven 3.9 (`mise.toml` at the repository root pins the JDK).

```bash
mvn clean package     # the unit tests (WMO codes, cache TTL), then target/classic-weather-<version>.jar
curl -u root:root1234 -X POST -F bundle=@target/classic-weather-<version>.jar -F start=true \
  http://localhost:8080/modules/api/bundles
```

From the repository root, `python3 scripts/seed-travel-test-site.py` builds the `ctrv-test` site,
whose destinations have coordinates. The second call within 10 minutes answers `"cached":true`:

```bash
curl -s http://localhost:8080/sites/ctrv-test/contents/travel/tokyo.weather.do
```

| File                   | Role                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| `WeatherAction.java`   | The Jahia action: reads the node, uses the cache, writes the JSON |
| `OpenMeteoClient.java` | One HTTP call to Open-Meteo                                       |
| `WeatherCache.java`    | In-memory cache with a TTL                                        |
| `WeatherCodes.java`    | WMO weather code to a short English label                         |

## License

MIT, see [LICENSE](../../LICENSE).
