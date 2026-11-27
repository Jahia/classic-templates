# Skylantern Airways demo site

Demo content and a seeder for **Skylantern Airways**, a **fictional** full-service airline based
at Hong Kong International Airport, built on the classic-templates template set (with the add-ons jsfaq, js-media-gallery,
js-store-locator, formidable-elements, and the companion module classic-travel when installed).

**Everything is invented**: the airline, its people, fares, phone numbers (`+852 0000 0000`
style), email addresses (`@skylantern.example`), addresses, press releases, job offers,
advisories, partners ("Harbourline Hotels", "Lumen Card", "Tidewater Car Rental", ...) and legal
texts. Only aircraft model names (A321neo, A330-300) and the IATA codes of real cities are real.
The structure of the site was inspired by the information architecture of a real regional
airline site; none of its names, logos, slogans, pictures or texts is reused. No booking,
check-in or payment can be made: the site says so on the home page, in the footer and on the
booking pages.

The site this seeder builds is the source of the [Skylantern pre-packaged website](../../packages/prepackaged-skylantern/README.md)
(exported by `scripts/export-prepackaged.py --site skylantern`). The Formidable demo forms on a site of their own
(`skylantern-forms`) are in [Jahia/formidable-extended-actions](https://github.com/Jahia/formidable-extended-actions/tree/main/demo/skylantern-forms).
Back to the [repository README](../../README.md).

## Files

| File                                 | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `airline_content.py`                 | All bilingual content as data (EN + idiomatic FR), in the shape of `classic-templates/scripts/demo_content.py`: page tree, meta descriptions (120 to 160 characters), sections per page, header and footer, categories, news (6 travel advisories, 4 press releases), articles (3 job offers, 3 partner offers), FAQ, sales offices, forms. Then, separated, the content of the **pass-2** components: `ACCORDIONS`, `TABS`, `ICON_TILES`, `LOGO_STRIPS`, `DESTINATIONS`, `FARE_OFFERS`, `TRAVEL_TOOLS`. `python3 airline_content.py` checks the data (both languages everywhere, description lengths, no long dashes, rich text headings starting at h2, links to known pages). |
| `images.py`                          | Generated "travel poster" artwork (Pillow, fixed seeds, deterministic): 10 destination posters, 8 hero banners (16:9), fleet, cabin and service pictures, the Skylantern logo (lantern mark and wordmark, transparent PNG, plus a light version for dark mode), 5 fictional partner monograms and 14 icons. Each image has an EN and FR title that describes the picture (its default text alternative). `python3 images.py --sheet` writes them and a contact sheet to `build/images/`.                                                                                                                                                                                         |
| `seed-airline.py`                    | The seeder (see below).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tools/check-breadcrumbs.py`         | Compares the visible breadcrumb of item pages with their JSON-LD BreadcrumbList, EN and FR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `glossaries/skylantern-aviation.csv` | The site's translation glossary for ai-assisted-translations (EN, FR, Hong Kong Chinese), with its [README](glossaries/README.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tools/check-pages.py`               | Checks every live page in EN and FR: HTTP 200, one h1, no heading jump, description length, images answering 200, menu depth.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Run

Requirements: Python 3 with Pillow, a running Jahia with classic-templates (and the add-ons)
deployed. `scripts/seed-demo.py` of this repository is imported as a library for the GraphQL helpers. Node is not needed.

```bash
cd scripts/skylantern
python3 airline_content.py          # check the content
python3 images.py --sheet           # optional: look at the artwork (the seeder renders it in memory)
python3 seed-airline.py --theme horizon --scheme light   # seeds the site "skylantern" (creates it when missing)
python3 seed-airline.py --pass1-only                     # only the pass-1 sections
python3 tools/check-pages.py        # live checks, anonymous visitor
```

Environment: `JAHIA_URL` (default `http://localhost:8080`), `JAHIA_USER` (default
`root:root1234`), `CLASSIC_TEMPLATES` (default: this checkout). One HTTP session is reused
for every call. Options: `--site` (default `skylantern`; `classic-dev`, `classic-addons` and
`ctrv-test` are refused), `--theme <value>` / `--scheme auto|light|dark` (set `ctplTheme` /
`ctplColorScheme` only while the site still has the default; the theme is checked against the
deployed choicelist). The local demo runs `--theme horizon --scheme light`.

The seeder is **add-only and idempotent**: a node that exists is never changed, an empty property
is filled but an editor's value is kept, and a second run creates nothing and publishes nothing.
It publishes (EN + FR) only the nodes it manages that are missing from the live workspace, from the
topmost one, files included, plus the few existing nodes it filled (header, footer, home).

What it builds: 36 pages (home, content and full-width templates; utility and legal pages hidden
from the menu, listed in the site map), the header logo and utility links (Manage booking,
Check-in, Flight status), the footer columns, legal links (with "Accessibility: partially
compliant") and social placeholders on example.com, a taxonomy in the system site (Skylantern
Airways demo > Travel advisories, Press releases, Careers, Partner offers) used by the content
lists' category filters, 10 news items and 6 articles, a FAQ (jsfaq, 5 sections, 11 questions), 4
sales offices on a map (js-store-locator, opening hours per day), a newsletter form and a contact
form (Formidable, answers saved in the JCR), and 54 images in `files/skylantern`.

## Pass 1 and pass 2

Pass 1 uses the components of classic-templates 0.1.2: hero banner, image and text, rich text
(with tables), columns, card grid (cards), key figures, quote, link list, content lists of news and
articles, site map and free zones for the add-ons.

Pass 2 (seeded by default since classic-templates 0.1.3-SNAPSHOT and classic-travel 0.1.0) adds:

- `ctpl:accordion`: baggage in detail, more fare rules;
- `ctpl:tabs`: "Before you fly" on home (flight deals, baggage, check-in, assistance), fare rules by fare;
- `ctpl:cardGrid` display `iconTiles` (home services, dangerous goods) and `logos` (fictional partners);
- classic-travel: 10 `ctrv:destination` items (`contents/destinations`, HKD "from" prices, facts,
  related destinations), 6 `ctrv:fareOffer` items (`contents/fares`, sales ending between
  31 October and 15 December 2026), `ctrv:fareList` on home (in the "Flight deals" tab) and Current deals,
  `ctrv:destinationGrid` on Destinations, `ctrv:travelTools` on home with the visible, editable
  demo notice.

The pass-2 data in `airline_content.py` keeps neutral keys (`intro`, `description_html`,
`from_price`, `answer_html`, ...); `seed_pass2()` maps them onto the property names of the types.
The home fare list sits in the first tab of "Before you fly" since classic-travel steps its
headings down inside a `ctpl:tab` (tabs h2, tab label h3, list title h4, cards h5). On a site
seeded before, the existing list node is moved there from `home/main/fares` (`moved_from`).

Pass 3 (classic-templates `feat/notice-bar-carousel`):

- a `ctpl:noticeBar` in the home page's header area, above the site header (so it shows on every
  page and is edited from home): the 3 latest items of the "Travel advisories" category, label
  "Travel advisories" / "Avis aux voyageurs", a "View all" link to the Advisories page, dismissible;
- a `ctpl:heroCarousel` on home (title hidden, autoplay off) with 3 slides: the pass-1 hero
  banner, moved into it (`adopt`), a winter Sapporo slide and a fleet slide;
- `itemLabel = category` on the lists of advisories, press releases and careers, so their rows
  read "Travel advisories", "Press releases", "Careers" instead of the content type (set on the
  existing lists while they still hold the default value).

### Changing what an earlier run seeded

The seeder stays add-only, with three explicit exceptions, all visible in `airline_content.py`:

- `RETIRED`: nodes earlier versions created and the content no longer has (the pass-1 demo
  notice on home, now carried by the travel tools). They are marked for deletion, then the
  deletion is published, which removes them from both workspaces.
- `adopt` (on a container) and `moved_from` (on a section): an existing node is moved into its new
  place instead of being created twice, so its links and an editor's changes are kept.
- `UPGRADES` in the seeder: a property added to a type after the node was created is set while it
  still holds the type's default.
- `HOME_TITLE`: the home page title seeded by the template set ("Home" / "Accueil") is replaced by
  "Flights from Hong Kong across Asia" / "Vols depuis Hong Kong vers l'Asie" (the hidden h1 and the
  browser title), only while it is still the default; only the two translation nodes are published.
  The breadcrumb's first crumb reads "Home" / "Accueil" (translated by the template set).
- `LISTING_PAGES`: each content folder points at the page that lists it (`ctplmix:listingPage`,
  `ctplListingPage`), so item pages get "Home > Destinations > Tokyo". Set while empty; only the
  folder node is published. `news` and `articles` hold two kinds of items each without sub-folders:
  `news` points at the Advisories page, `articles` at Careers (press releases and partner offers
  therefore show that trail too). `tools/check-breadcrumbs.py` compares the visible trail with the
  JSON-LD BreadcrumbList.
