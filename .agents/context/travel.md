# classic-travel: architecture, rules and gates

The module lives in `packages/travel` (paths below are relative to it unless they start with the
repository root). It follows the template set's conventions (heading policy, theming tokens, link
and media mixins, rich-text sanitizer): read [`architecture.md`](architecture.md) too before
changing a view.

## Non-negotiables

1. Namespaces are `ctrv` (types) and `ctrvmix` (mixins), URIs `http://www.jahia.org/classic-travel/{nt,mix}/1.0`. Never rename them once content exists.
2. classic-templates is a declared dependency: reuse its mixins (`ctplmix:listable`, `ctplmix:media`, `ctplmix:cta`, `ctplmix:sectionStyle`, `ctplmix:pageComponent`), never redeclare their fields.
3. No TypeScript import from classic-templates (separate bundle): small helpers are copied into `src/lib` and kept in step (`sanitize.ts` is the classic-templates sanitizer with the `ctrv-` prefixes).
4. Views read classic-templates semantic tokens only (`var(--ctpl-color-*)`...), never a literal or a primitive (`yarn check:tokens`).
5. Every visible string is contributed content or a locale key in `settings/locales` (EN and FR); every type and field has an EN and FR label and tooltip.
6. The page's only `<h1>` is the title of a main resource in its `fullPage` view (as classic-templates news); sections start at `h2` and follow the column / tab / free-zone rule.
7. Deploy after each change: `yarn build && yarn deploy` from `packages/travel`. Never run `yarn dev` from an agent. Never touch the `classic-dev` site.

## Purpose

Travel content for sites built on classic-templates (first user: the fictional airline demo
"Skylantern Airways", site key `skylantern`): destinations and fare offers as main resources, two
automatic listings, and a travel tools section. Generic pieces (accordion, tabs as a generic
component, themes) belong in classic-templates, not here.

## Type inventory

| Type                     | Supertypes (besides `jnt:content`)                                                                                                                  | Views                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `ctrv:destination`       | `mix:title`, `jmix:mainResource`, `jmix:editorialContent`, `ctrvmix:component`, `ctplmix:listable`, `ctplmix:media`, `ctrvmix:price`                | default (card), card, compact, fullPage, mosaicCard |
| `ctrv:fareOffer`         | `mix:title`, `jmix:mainResource`, `jmix:editorialContent`, `ctrvmix:component`, `ctplmix:listable`, `ctrvmix:price`, `ctplmix:cta`                  | default (card), card, compact, fullPage             |
| `ctrv:fareList`          | `mix:title`, `ctrvmix:pageComponent`, `ctplmix:sectionStyle`, `ctplmix:cta`, `ctrvmix:travelList`, `jmix:list`, `jmix:renderableList`, `jmix:cache` | default                                             |
| `ctrv:destinationGrid`   | same as the fare list, without `sort`                                                                                                               | default                                             |
| `ctrv:destinationMosaic` | `mix:title`, `ctrvmix:pageComponent`, `ctplmix:sectionStyle`; `destinations` (weakreference multiple `< ctrv:destination`)                          | default                                             |
| `ctrv:travelTools`       | `mix:title`, `ctrvmix:pageComponent`, `ctplmix:sectionStyle`, `jmix:list` (orderable, `+ * (ctrv:travelTool)`)                                      | default                                             |
| `ctrv:travelTool`        | `mix:title`, `ctplmix:cta` (never hidden: editors select each tool in Page Builder)                                                                 | default                                             |

Mixins: `ctrvmix:component` (> `ctplmix:component`, groups the types), `ctrvmix:pageComponent`
(> `ctrvmix:component`, `ctplmix:pageComponent`: accepted in `ctpl:pageArea`, `ctpl:column`,
`ctpl:freeZone`), `ctrvmix:price` (price, currency, priceNote), `ctrvmix:travelList` (startNode,
region, maxItems, noResultText).

## Contract with classic-templates

- **Rendering a main resource.** classic-templates' `jmix:mainResource` template renders the item's
  `fullPage` view in its page shell (header, footer, `<title>` from `jcr:title`, meta description
  from `jcr:description` or `teaser`, page JSON-LD graph). Items that are not `ctplmix:editorialItem`
  are wrapped in `.ctpl-container`. So a `fullPage` view renders the `<h1>` itself and no container.
  The destination's short text is named `teaser` on purpose: it becomes the meta description.
- **Content lists.** `ctpl:jcrQuery` offers every `ctplmix:listable` subtype in its type picker and
  renders items with the `card` (grid) or `compact` (list) view, passing `headingLevel` as a module
  parameter. Both item types implement these views and read that parameter. Its sort criteria
  (publication date, created, modified, title) apply to the travel types too; price and end-of-sale
  sorting is the fare list's job.
- **Headings.** Sections are `h2` in a page area and step down one level under each container that
  shows a heading: a titled `ctpl:columns` row (for its columns), a `ctpl:tab` (one below its label,
  itself one below a titled `ctpl:tabs`) and a titled `ctpl:freeZone`. Containers nest, so the level
  is worked out up the tree and clamped to `h6`; each container is a cache dependency
  (`lib/level.ts`, unit tested, wired in `lib/Heading.tsx`; same rule as classic-templates). Card
  headings come from the list (`headingLevel`).
- **Tokens.** Views read `--ctpl-*` semantic tokens. Prices use
  `var(--ctpl-color-highlight, var(--ctpl-color-accent))`: the highlight role is newer than
  classic-templates 0.1.2.
- **Global classes used:** `ctpl-container` (layout) and `ctpl-prose` (rich text). Everything else
  is in this module's CSS modules.
- **Stylesheet.** The module has no page template, so every view adds `dist/assets/style.css`
  itself (`lib/Styles.tsx`); Jahia adds it once per page.

## Decisions

- **Destination mosaic** (from the Avitron demo, 2026-10-06). 1 to 4 picked destinations: one card
  full width, two side by side, three as a large card and a column of two, four as a large card and
  a column of one above two. More than four picked: the first four, and an edit-mode note. Each card
  is the destination's `mosaicCard` view (`<Render readOnly>`): a cached fragment of its own,
  refreshed when the destination changes, with no edit-mode wrapper to break the grid.
- **Live weather as an island.** Jahia caches the rendered HTML, so live data is never baked into
  it: `WeatherChip.client.tsx` is a `clientOnly` island that fetches
  `buildNodeUrl(node, { extension: ".weather.do", mode: "live" })` (never a literal, never
  Open-Meteo directly) on the first hover or focus of its card, at once on touch screens. The call
  is anonymous (`credentials: "omit"`): Jahia's CSRF guard refuses a `.do` call from a logged-in
  user without a token, which would hide the chip from editors. The chip names the condition from
  the WMO code with a locale key (`lib/weather.ts`, unit-tested), so it is translated; the island
  receives those strings as props. It renders nothing when the endpoint fails or is not installed.
- **Coordinates on the destination.** `latitude` and `longitude` are fields of `ctrv:destination`:
  the weather action reads them from the node, and the destination page writes them as the
  `geo` of its JSON-LD.
- **classic-weather** (`packages/weather`) is a Java module with one action, `weather`, on any node
  with `latitude` and `longitude`: Open-Meteo, 3 s connect and 5 s read timeouts, an in-memory cache
  per node for 600 s (`cacheTtlSeconds` in the OSGi configuration
  `org.jahia.modules.classicweather`), `Cache-Control: public, max-age=600`, failures not cached.
  It is optional: classic-travel does not declare it as a dependency.

- **Filtering and sorting in code** (`lib/select.ts`): the region of a fare is its destination's,
  destination order follows the page language (`Intl.Collator`), ended sales depend on today. The
  query (`lib/query.ts`) only selects a type under a path, at most `FETCH_LIMIT` (200) rows; no
  `NOT ISSAMENODE` (unreliable on 8.2.3.2).
- **Ended sales.** A fare whose `saleEnds` day is before today (UTC) leaves the fare list, and its
  card and page say "Sale ended". The fare views and the fare list expire from the cache after an
  hour so the change shows without a publication.
- **Prices for screen readers.** The visible "From HKD 1,280" is `aria-hidden`; a visually hidden
  copy reads "From 1,280 Hong Kong dollars" (`Intl.NumberFormat` `currencyDisplay: "name"`), since
  a code is read letter by letter.
- **Weak references read inline** (a fare's destination city and image) add an explicit cache
  dependency on the referenced node (`lib/travel.ts`); full cards of other nodes go through
  `<Render view="card">`.
- **Tabs as progressive enhancement** (`static/js/travel-tools.js`): stacked sections without
  JavaScript and in edit mode (no script there), WAI-ARIA tabs live (roving tabindex, arrows, Home,
  End, automatic activation; the tab list is named by the section heading).
- **JSON-LD**: one entity per item page (`TouristDestination`, `Offer`), pointing at the page's
  `WebPage` by `@id`; the page graph is classic-templates'. Text of the script element, `<` written
  as `\u003c`, no raw-HTML sink.

## Open questions

- Should the price-from on a destination be computed from its fare offers instead of contributed?
- `jcrQuery` sort criteria: add `price` / `saleEnds` in classic-templates if editors want those
  orders in a generic content list.
- Region list: fixed choicelist; a site that needs its own regions would rather use categories.

## Gates

Run them from `packages/travel` (Node 22: `source ~/.nvm/nvm.sh && nvm use 22`), with
`AISTARTUPKIT` set to the AIStartupKit checkout. The pull-request workflow runs the lint, format,
token and unit-test gates for this package too.

| Gate               | Command                                                                                                                                                                                                                                                                                            | Passes when                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Type-check + build | `yarn build`                                                                                                                                                                                                                                                                                       | exit 0, `dist/package.tgz` produced                                                |
| Unit tests         | `TZ=UTC yarn test:unit` (also under another time zone when touching dates)                                                                                                                                                                                                                         | all pass                                                                           |
| Lint + format      | `yarn lint && yarn prettier --check .`                                                                                                                                                                                                                                                             | no error                                                                           |
| CND                | `node $AISTARTUPKIT/.agents/skills/jahia-dev-review-cnd/scripts/check-cnd.mjs .`                                                                                                                                                                                                                   | PASS                                                                               |
| No literal colours | `yarn check:tokens`                                                                                                                                                                                                                                                                                | nothing outside the classic-templates tokens                                       |
| Deploy             | `yarn deploy`, then `curl -s -u root:root1234 'http://localhost:8080/modules/api/bundles/org.jahia.modules.javascript/classic-travel/*/_info'`                                                                                                                                                     | `ACTIVE` / `STARTED`, and the `ctrv:*` types listed by GraphQL `jcr { nodeTypes }` |
| Weather unit tests | `mvn -B package` from `packages/weather` (JDK 17)                                                                                                                                                                                                                                                  | 25 tests pass                                                                      |
| Weather deploy     | `curl -s -u root:root1234 -X POST -F bundle=@target/classic-weather-<version>.jar -F start=true http://localhost:8080/modules/api/bundles`, then `curl -s http://localhost:8080/sites/ctrv-test/contents/travel/tokyo.weather.do` twice                                                            | `200`, then `"cached":true`                                                        |
| Live check         | `python3 scripts/seed-travel-test-site.py` from the repository root (site `ctrv-test`), then hover a mosaic card (its weather chip shows), then axe (all rules) on the travel page, a destination and a fare offer, EN and FR, light and dark (site settings `ctplColorScheme`), and 320 px reflow | no violation, no horizontal scroll                                                 |

## Traps met while setting up

- `0.Modules/` has its own `package.json`: the committed `yarn.lock` marks the package as a
  standalone project. Run Yarn from `packages/travel`.
- The scaffold's create-module CLI is interactive only; it was driven with `expect` ("An empty
  module").
- A CND prefix already registered elsewhere fails silently: `ctrv` / `ctrvmix` were checked free on
  the instance (Jahia `NodeTypeRegistry` namespaces and the Jackrabbit namespace registry) before
  the first deploy.
- A Java module under `org.jahia.modules` with this symbolic name failed to install on 8.2.4
  ("Unable to find a module bundle corresponding to the key"); under the repository's
  `org.jahia.modules.javascript` it installs. classic-weather keeps the inherited groupId.
- Theme and scheme switches from zsh: `for look in "a b"` does not split; drive them from bash.
