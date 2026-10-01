# Architecture: classic-travel

## Purpose

Travel content for sites built on classic-templates (first user: the fictional airline demo
"Skylantern Airways", site key `skylantern`): destinations and fare offers as main resources, two
automatic listings, and a travel tools section. Generic pieces (accordion, tabs as a generic
component, themes) belong in classic-templates, not here.

## Type inventory

| Type                   | Supertypes (besides `jnt:content`)                                                                                                                  | Views                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `ctrv:destination`     | `mix:title`, `jmix:mainResource`, `jmix:editorialContent`, `ctrvmix:component`, `ctplmix:listable`, `ctplmix:media`, `ctrvmix:price`                | default (card), card, compact, fullPage |
| `ctrv:fareOffer`       | `mix:title`, `jmix:mainResource`, `jmix:editorialContent`, `ctrvmix:component`, `ctplmix:listable`, `ctrvmix:price`, `ctplmix:cta`                  | default (card), card, compact, fullPage |
| `ctrv:fareList`        | `mix:title`, `ctrvmix:pageComponent`, `ctplmix:sectionStyle`, `ctplmix:cta`, `ctrvmix:travelList`, `jmix:list`, `jmix:renderableList`, `jmix:cache` | default                                 |
| `ctrv:destinationGrid` | same as the fare list, without `sort`                                                                                                               | default                                 |
| `ctrv:travelTools`     | `mix:title`, `ctrvmix:pageComponent`, `ctplmix:sectionStyle`, `jmix:list` (orderable, `+ * (ctrv:travelTool)`)                                      | default                                 |
| `ctrv:travelTool`      | `mix:title`, `ctplmix:cta` (never hidden: editors select each tool in Page Builder)                                                                 | default                                 |

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
- **Headings.** Sections are `h2`, `h3` inside a titled `ctpl:column` row or a titled
  `ctpl:freeZone` (`lib/Heading.tsx`, same rule as classic-templates). Card headings come from the
  list (`headingLevel`).
- **Tokens.** Views read `--ctpl-*` semantic tokens. Prices use
  `var(--ctpl-color-highlight, var(--ctpl-color-accent))`: the highlight role is newer than
  classic-templates 0.1.2.
- **Global classes used:** `ctpl-container` (layout) and `ctpl-prose` (rich text). Everything else
  is in this module's CSS modules.
- **Stylesheet.** The module has no page template, so every view adds `dist/assets/style.css`
  itself (`lib/Styles.tsx`); Jahia adds it once per page.

## Decisions

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
