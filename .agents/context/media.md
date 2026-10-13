# classic-media: architecture, rules and gates

The module lives in `packages/media` (paths below are relative to it unless they start with the
repository root). It follows the template set's conventions (heading policy, theming tokens, link
and media mixins, rich-text sanitizer) exactly as classic-travel does: read
[`travel.md`](travel.md) for the shared contract and [`architecture.md`](architecture.md) before
changing a view. This file says what differs.

## Non-negotiables

1. Namespaces are `ctmd` (types) and `ctmdmix` (mixins), URIs `http://www.jahia.org/classic-media/{nt,mix}/1.0` (checked free on the local instance before the first deploy, 2026-10-13). Never rename them once content exists.
2. classic-templates is a declared dependency: reuse its mixins (`ctplmix:editorialItem`, `ctplmix:listable`, `ctplmix:media`, `ctplmix:cta`, `ctplmix:sectionStyle`, `ctplmix:pageComponent`, `ctplmix:membersOnly`) and its `ctpl:link`, never redeclare their fields.
3. No TypeScript import from classic-templates or classic-travel (separate bundles): helpers are copied into `src/lib` and kept in step (`sanitize.ts` with the `ctmd-` prefixes).
4. No dependency on js-media-gallery: a story's `video` is an unconstrained weakreference rendered through the picked node's own view.
5. Topics are platform categories (`j:defaultCategory`), never a field. The story feed's `filterCategories` is a listing criterion (the AIStartupKit rule 21 exception).
6. Views read classic-templates semantic tokens only; every visible string is contributed content or a locale key (EN and FR); every type and field has an EN and FR label and tooltip.
7. Interactive behaviour is progressive enhancement in `static/js/media.js`, never loaded in edit mode: without JavaScript every story, session and day stays visible, and no button shows that would do nothing.

## Type inventory

| Type                  | Supertypes (besides `jnt:content`)                                                                                                                             | Views                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `ctmd:person`         | `mix:title`, `jmix:mainResource`, `jmix:editorialContent`, `ctmdmix:component`, `ctplmix:listable`, `ctplmix:media`, `jmix:list` (`+ * (ctpl:link)`: profiles) | default (card), card, compact, fullPage (`cache.expiration` 300)                 |
| `ctmd:story`          | `mix:title`, `jmix:mainResource`, `jmix:editorialContent`, `ctmdmix:component`, `ctplmix:editorialItem`                                                        | default (card), card, compact, tile, fullPage, fullPageMembers (`cache.perUser`) |
| `ctmd:storyFeed`      | `mix:title`, `ctmdmix:pageComponent`, `ctplmix:sectionStyle`, `jmix:list`, `jmix:renderableList`, `jmix:cache`                                                 | default                                                                          |
| `ctmd:session`        | `mix:title`, `jmix:mainResource`, `jmix:editorialContent`, `ctmdmix:component`, `ctplmix:listable`, `jmix:list` (`+ * (ctmd:sessionSpeaker)`)                  | default (card), card, compact (agenda row), fullPage                             |
| `ctmd:sessionSpeaker` | (person weakreference + `speakerRole`)                                                                                                                         | default (edit view)                                                              |
| `ctmd:agenda`         | as the feed                                                                                                                                                    | default                                                                          |
| `ctmd:speakerGallery` | as the feed                                                                                                                                                    | default                                                                          |
| `ctmd:keyDates`       | `mix:title`, `ctmdmix:pageComponent`, `ctplmix:sectionStyle`, `jmix:list` (`+ * (ctmd:keyDate)`)                                                               | default                                                                          |
| `ctmd:keyDate`        | `mix:title`                                                                                                                                                    | default                                                                          |
| `ctmd:searchResults`  | `mix:title`, `ctmdmix:pageComponent`, `ctplmix:sectionStyle`                                                                                                   | default (`cache.expiration` 0)                                                   |

Mixins: `ctmdmix:component`, `ctmdmix:pageComponent` (as travel), `ctmdmix:eventFolder`
(`extends = jnt:contentFolder`, `ctmdTimeZone`, IANA name, default UTC).

## Decisions

- **One person type** for authors and speakers. A person page finds the person's stories (`authors`)
  and sessions (speakers pointing at the person) under `/sites`: people are shared across a group's
  sites (an editorial hub's authors speak at its event). Such a list cannot be flushed precisely, so
  the view expires after five minutes (`cache.expiration`) instead of depending on every site.
- **Members-only stories** follow classic-templates: the main-resource template renders
  `fullPageMembers` (cached per user) for a flagged item; the shared `fullPage` never renders the
  body of such a story. The teaser page links to the site's sign-in page (`signInPage` of the
  classic-templates header) when it has one.
- **Event time zone** on the event folder (`ctmdmix:eventFolder`), read by sessions (nearest
  ancestor), the agenda (its start folder, else its first session) and nothing else. Times are
  written with `Intl` in that zone; `<time datetime>` carries the zone's offset (`isoInZone`).
- **Related stories** are computed: stories of the same site sharing the most categories, newest
  first among equals (`lib/select.ts`, unit tested), at most three.
- **Queries** (`lib/query.ts`): allow-listed types, orders and formats; UUID-checked identifiers;
  paths quoted as literals. A list depends on everything under its start node (path regex), a feed
  on "this page's topics" on the page too.
- **JSON-LD**: one entity per item page (Person, NewsArticle / Article / OpinionNewsArticle / Report
  / VideoObject / PodcastEpisode by format, Event), pointing at the page's `WebPage` by `@id`.
  `isAccessibleForFree: false` for a members-only story.
- **Search** (`ctmd:searchResults`): a GET form (`q`) and the Augmented Search results read on the
  server with `useGQLQuery` (the `search` field, live workspace, page language), as the visitor;
  scope "network" adds the sites the header's network bar links to. Excerpts are rebuilt as text
  parts from the `<em>` highlights (`lib/search.ts`, unit tested): no index markup reaches the page.
  Not cached (`cache.expiration` 0). Needs Augmented Search installed and the sites indexed.
- **Tracking** (`static/js/media.js`): when jExperience runs on the page and tracks the visitor
  (`wem.getLoadedContext().profileId` and `wemInitConfig.activateWem === true`, so after consent
  where the site asks for it), the script sends standard jCustomer events only (jCustomer 3 drops a
  type without a schema): `video` (`action` play, once per page view, and ended) for a story's
  video or audio (`data-ctmd-track-media`), `click` for share (`type` share, `method` native / copy)
  and filters (`type` filter, `facet`, `value`), one `search` per results page
  (`data-ctmd-track-search`, `keyword`, `language`, `origin` `ctmd:searchResults`). The target is
  the nearest `data-ctmd-track` node (story, feed, agenda, search section). Without jExperience,
  before consent or after a refusal, nothing is sent. Verified end to end on the Orvane sites
  (`orvane-demo/tools/check-media-events.mjs`).
- **Accessibility**: agenda days are WAI-ARIA tabs only once the script runs; filters are a group of
  `aria-pressed` toggles (feed) or labelled selects (agenda) with a polite status; the countdown is
  built in the browser so a cached page never shows a stale count; audio always comes with a
  transcript in a `<details>`.

## Gates

Run them from `packages/media` (Node 22), with `AISTARTUPKIT` set to the AIStartupKit checkout. The
pull-request workflow runs the lint, format, token and unit-test gates for this package too.

| Gate               | Command                                                                                                                                                                                                                                                                 | Passes when                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Type-check + build | `yarn build`                                                                                                                                                                                                                                                            | exit 0, `dist/package.tgz` produced                                         |
| Unit tests         | `TZ=UTC yarn test:unit` (also under another time zone: dates and times)                                                                                                                                                                                                 | all pass                                                                    |
| Lint + format      | `yarn lint && yarn prettier --check .`                                                                                                                                                                                                                                  | no error, the SonarQube rules included                                      |
| CND                | `node $AISTARTUPKIT/.claude/skills/jahia-dev-review-cnd/scripts/check-cnd.mjs .`                                                                                                                                                                                        | PASS                                                                        |
| No literal colours | `yarn check:tokens`                                                                                                                                                                                                                                                     | nothing outside the classic-templates tokens                                |
| Deploy             | `yarn deploy`, then `curl -s -u root:root1234 'http://localhost:8080/modules/api/bundles/org.jahia.modules.javascript/classic-media/*/_info'`                                                                                                                           | `ACTIVE` / `STARTED`, the `ctmd:*` types listed by GraphQL `nodeTypeByName` |
| Live check         | `python3 scripts/seed-media-test-site.py` from the repository root (site `ctmd-test`), then the AIStartupKit site review on its pages (stories, topic, programme, every item page), EN and FR, default theme light and dark plus `signal` and `live`, and 320 px reflow | no violation, no horizontal scroll                                          |

## Traps met while building

- A `\uXXXX` sequence typed in an agent's shell command reaches the file decoded (a `<`, a NUL, a
  combining accent): write such escapes from a script (`chr(92)`), or avoid them (`\p{Diacritic}`).
- `ctaLabel` on a section needs the optional `ctplmix:cta` mixin added with it (the property is not
  defined on the type itself).
