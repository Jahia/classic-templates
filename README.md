# classic-travel

Travel content for Jahia sites built on the [classic-templates](https://github.com/Jahia/classic-templates)
template set: destinations and fare offers with their own pages, automatic fare and destination
lists, and a travel tools section shown as tabs. Built for travel and airline demonstration sites;
every text and link is contributed content, in every site language.

The module has no page template: its content renders inside classic-templates pages and follows the
site's classic-templates theme (light and dark) through its design tokens.

## Requirements

- Jahia 8.2.1 or later with `javascript-modules-engine` 1.2 or later.
- **classic-templates** installed and used by the site (declared module dependency): the travel
  types reuse its mixins, page areas, content list and design tokens.

## Installation

Install the package (`dist/package.tgz`, built by CI or by `yarn build`) in Jahia, then enable
**classic-travel** on a site that uses the classic-templates template set (Site settings >
Modules, or the provisioning API: `- enable: "classic-travel"` with `site: "<siteKey>"`).

## Content types

| Type                                      | What it is                                                                                                                                    | Where it goes                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Destination (`ctrv:destination`)          | A city served: airport code, country, region, teaser, description, image, "from" price and its note, key facts, related destinations          | A content folder. Own page; cards in destination grids and content lists |
| Fare offer (`ctrv:fareOffer`)             | A fare to one destination: departure city, cabin, price, travel period, end of sale, conditions, call to action                               | A content folder. Own page; cards in fare lists and content lists        |
| Fare list (`ctrv:fareList`)               | A section listing fare offers under a folder, by region of the destination, sorted by price, end of sale or destination; ended sales left out | Page areas, columns and free zones of classic-templates pages            |
| Destination grid (`ctrv:destinationGrid`) | A section listing destinations under a folder, by region, from A to Z, with their "from" price                                                | Page areas, columns and free zones                                       |
| Travel tools (`ctrv:travelTools`)         | A section of tools (book, manage, check in), each a tab with its text and link, and a notice shown to every visitor                           | Page areas, columns and free zones                                       |

Destinations and fare offers are also listable by the classic-templates **Content list**
(`ctpl:jcrQuery`: pick "Destination" or "Fare offer" as the content to list), in cards or as a
compact list. Tags and categories are the platform's own, available on every item.

### Fields

| Type             | Fields                                                                                                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Destination      | City (`jcr:title`), airport code (3 capital letters), country, region, teaser, description (rich text), image with its text alternative or decorative flag, price from, currency, price note, local currency, language, time zone, electricity, dialling code, related destinations |
| Fare offer       | Offer name (`jcr:title`), destination, departure city, cabin (economy, premium economy, business), price from, currency, price note, travel from, travel until, sale ends, fare conditions (rich text), button label and link                                                       |
| Fare list        | Title, look under, region, sort, number of items, text when empty, background, "see all" button                                                                                                                                                                                     |
| Destination grid | Title, look under, region, number of items, text when empty, background, "see all" button                                                                                                                                                                                           |
| Travel tools     | Title, notice, background, optional button; each tool: tab label, text (rich text), icon, button label and link                                                                                                                                                                     |

Every field has an English and a French label and tooltip in the content editor.

## Editor usage

1. Create a content folder (for example `Travel`) and add destinations to it, then a sub-folder
   (`Fares`) with fare offers. Pick each offer's destination: cards show its city and image, and
   fare lists filter on its region.
2. On a page, add a **Fare list** and point **Look under** at the fares folder; choose the region
   and the order. Add a **Destination grid** the same way.
3. Add a **Travel tools** section, write its notice (for a demonstration site: "This is a
   demonstration site: no booking is made"), and add one tool per tab, each with its button.
4. Publish the folders and the page. Publishing content does not publish the images it uses:
   publish the image folder too.

Links (buttons) are set per language: a link set in English only has no target in French, and
edit mode says so. A fare offer whose sale has ended leaves the fare lists the next day, and its
page says the sale has ended; edit mode shows how many offers each list leaves out and why.

## Accessibility and SEO

- One `<h1>` per page: the city or the offer name on its own page (the page template of
  classic-templates renders the rest of the page). Sections start at `h2`, one level lower inside a
  titled column row, a tab (under its label) or a titled free zone, nested containers included;
  card headings follow their list.
- Prices read well aloud: "From HKD 1,280" for the eye, "From 1,280 Hong Kong dollars" for screen
  readers. Dates are written in the page's language.
- Cards are whole-card links named by the city, with the cabin and departure city added for screen
  readers; images on cards are decorative.
- Travel tools are WAI-ARIA tabs (arrow keys, Home, End) built from stacked sections, which remain
  as they are without JavaScript and in edit mode.
- Rich text is sanitised at render time with the classic-templates allow-list (headings renumbered
  under the section heading, tables in a focusable scroll region).
- Destination and offer pages carry schema.org JSON-LD (`TouristDestination`, `Offer`), linked to the
  page graph written by classic-templates.
- Checked with axe (all rules) in light and dark schemes, EN and FR, and at 320 px wide.

## Theming

The views read the classic-templates semantic tokens only (`--ctpl-color-*`, `--ctpl-font-*`,
`--ctpl-space-*`...), so they follow every theme and colour scheme chosen in the site settings.
Prices use the theme's highlight colour, `--ctpl-color-highlight`, and fall back to the accent
colour with versions of classic-templates that do not define it.

## Development

Node 22 and Yarn 4 (Corepack). Run every command from the module root.

```bash
yarn install
yarn build && yarn deploy     # build the package and install it in the local Jahia (http://localhost:8080)
yarn lint                     # ESLint
yarn test                     # Vitest unit tests (formatting, selection, queries, sanitizer, JSON-LD)
yarn check:tokens             # no literal colour or primitive token in the stylesheets
python3 scripts/seed-test-site.py   # test site "ctrv-test" with EN and FR travel content
```

`yarn deploy` reads `JAHIA_HOST` and `JAHIA_USER` from `.env` (defaults `http://localhost:8080` and
`root:root1234`). The CND files are checked with the AIStartupKit `check-cnd.mjs`. AI agents start
with [`.agents/README.md`](.agents/README.md).

```
src/
├── components/Travel/<Type>/   definition.cnd, types.ts, views and CSS modules per type
├── lib/                        formatting, selection and query helpers (unit-tested), shared views
settings/                       namespaces and shared mixins, EN/FR labels, locales, type icons
static/js/travel-tools.js       tabs enhancement
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT, see [LICENSE](LICENSE).
