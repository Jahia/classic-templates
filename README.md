# Classic Templates

A themeable Jahia JavaScript template set with the standard building blocks of a corporate or
institutional website: a header with logo, three-level menu, utility links and language switcher,
a footer, a breadcrumb trail, and a library of reusable sections, plus news and articles with their
own pages.

Everything a visitor reads is contributed content, editable in Page Builder and jContent, in every
language of the site. The look comes entirely from CSS design tokens: a site switches theme, or
light and dark, from its settings, with no code change.

![The demo home page in the Classic theme](docs/images/home.png)

> **Status:** 0.1.0, in development, not released yet.

## Highlights

- **Complete site chrome.** A header with a logo (with an optional dark-mode variant), a brand
  name, a menu built from the page tree three levels deep, utility links and a language switcher.
  A footer with a tagline, link columns, legal and social links and a copyright line. A breadcrumb
  trail. Header and footer are shared by every page and edited on the home page.
- **Reusable sections.** Hero banner, image and text, rich text, columns, card grid (cards, icon
  tiles or logos), accordion, tabs, key figures, quote, link list, content list, site map and free
  zone. Every section can end with an optional call to action. Tables in rich text scroll on
  small screens.
- **News and articles.** Stored in content folders, each with its own page, listed as cards or
  compact rows by content lists that filter by folder, category and language.
- **Themes.** Four themes (Classic, Ocean, Terracotta, Horizon), each in light and dark, chosen per site.
  Visitors get their system's scheme unless the site forces one. Contrast is checked for every
  theme and scheme.
- **Accessible by default.** WCAG 2.1 AA and RGAA 4.1.2 audited. Skip link, landmarks, strict
  heading order, keyboard menu, visible focus, reflow at 320 px, language-aware links, a site map as
  the second navigation system. Rich text is cleaned and restructured when it is rendered.
- **Search-engine ready.** One `<h1>` per page, titles and descriptions, image alternatives, and
  schema.org structured data (JSON-LD) on every page: WebSite, Organization, WebPage, the
  breadcrumb, and NewsArticle or Article on news and articles.
- **Open to other modules.** A free zone section takes components of other modules (Formidable
  forms, a FAQ, a media gallery, a store locator), and a token bridge makes them follow the
  site's theme.
- **Bilingual out of the box.** Every editor label, tooltip and visitor-facing string is
  available in English and French.

## Components

| Component         | What it is for                                                | Docs                                                            |
| ----------------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| Site header       | Logo, brand name, main menu, utility links, language switcher | [site-header](docs/components/site-header.md)                   |
| Site footer       | Tagline, link columns, legal and social links, copyright      | [site-footer](docs/components/site-footer.md)                   |
| Breadcrumb        | The trail from home to the current page, above the content    | [breadcrumb](docs/components/breadcrumb.md)                     |
| Hero banner       | The banner at the top of a page: photo, split or plain        | [hero-banner](docs/components/hero-banner.md)                   |
| Image and text    | An image beside a heading, rich text and a button             | [image-and-text](docs/components/image-and-text.md)             |
| Rich text         | A heading and formatted text, at reading width or wide        | [rich-text](docs/components/rich-text.md)                       |
| Columns           | Two, three or four columns of sections                        | [columns](docs/components/columns.md)                           |
| Card grid         | Hand-picked cards, icon tiles or a logo strip                 | [card-grid](docs/components/card-grid.md)                       |
| Accordion         | Entries that open and close, such as questions and answers    | [accordion](docs/components/accordion.md)                       |
| Key figures       | A row of figures with their labels                            | [key-figures](docs/components/key-figures.md)                   |
| Quote             | A quotation with the person's name, role and portrait         | [quote](docs/components/quote.md)                               |
| Link list         | A list of links: a section, a bar or a footer column          | [links-and-link-lists](docs/components/links-and-link-lists.md) |
| Content list      | News or articles found automatically, sorted and filtered     | [content-list](docs/components/content-list.md)                 |
| Notice bar        | A slim band of the latest items as dated links, dismissible   | [notice-bar](docs/components/notice-bar.md)                     |
| News and articles | Editorial items with their own page, card and compact views   | [news-and-articles](docs/components/news-and-articles.md)       |
| Site map          | Every page of the site as nested lists                        | [site-map](docs/components/site-map.md)                         |
| Tabs              | Tabs, each holding its own sections                           | [tabs](docs/components/tabs.md)                                 |
| Free zone         | A section for components of other modules                     | [free-zone](docs/components/free-zone.md)                       |
| Call to action    | The optional button any section can end with                  | [call-to-action](docs/components/call-to-action.md)             |

Shared settings used across components: [section backgrounds](docs/components/section-style.md)
and [images and their alternatives](docs/components/images.md).

## Documentation

The full documentation for editors and site administrators is in [`docs/`](docs/README.md):

- **Guides:** [getting started](docs/guides/getting-started.md),
  [pages and templates](docs/guides/pages-and-templates.md),
  [editing content](docs/guides/editing-content.md),
  [themes and appearance](docs/guides/themes-and-appearance.md),
  [accessibility](docs/guides/accessibility.md), [search engines](docs/guides/seo.md),
  [add-on modules](docs/guides/add-ons.md), [questions and answers](docs/guides/faq.md).
- **Component reference:** [all components](docs/components/index.md).

## Themes

The theme and colour scheme are site settings: edit the site in jContent and, under "Site look",
choose a "Theme" and "Light or dark". "Automatic" follows each visitor's system setting.

|                           | Light                                                        | Dark                                                       |
| ------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Classic (navy)            | ![Classic, light](docs/images/theme-default-light.png)       | ![Classic, dark](docs/images/theme-default-dark.png)       |
| Ocean (teal)              | ![Ocean, light](docs/images/theme-ocean-light.png)           | ![Ocean, dark](docs/images/theme-ocean-dark.png)           |
| Terracotta (warm)         | ![Terracotta, light](docs/images/theme-terracotta-light.png) | ![Terracotta, dark](docs/images/theme-terracotta-dark.png) |
| Horizon (navy and orange) | ![Horizon, light](docs/images/theme-horizon-light.png)       | ![Horizon, dark](docs/images/theme-horizon-dark.png)       |

Components never contain a colour, font or shadow value. They read semantic CSS custom properties
(`--ctpl-color-text`, `--ctpl-color-accent`, `--ctpl-color-highlight`, ...) defined in `src/templates/tokens.css`, in three
tiers: primitives, semantic roles in `light-dark()` pairs, and a few component settings. A theme is
a set of overrides of the semantic tokens under `[data-ctpl-theme="<name>"]`. Adding one means
adding its tokens, its value to the site-settings choice list (with EN and FR labels), and running
`yarn check:contrast`.

## Accessibility and search engines

- Audited against WCAG 2.1 AA (axe-core, the full rule set, on every page, in every theme and
  scheme) and against RGAA 4.1.2 by a manual review. The review covers keyboard use, focus
  visibility over images, reflow at 320 px, text spacing, styles off, language changes,
  navigation systems and the heading outline. Screen readers have not been tested yet.
- Editors keep control of what only they can decide: alternative texts (per use, or "decorative"),
  headings and link labels. Edit mode shows a hint when something is missing.
- In France, the accessibility statement and the "Accessibilité : ... conforme" mention are site
  content. The demo site shows how: a statement page linked from the footer legal links.
- Structured data is generated from the content itself; there is nothing to fill in beyond good
  titles, teasers, dates, authors and tags. Use Jahia's `sitemap` module for `sitemap.xml`; the
  site map component is the page visitors read.

See the [accessibility](docs/guides/accessibility.md) and [search engines](docs/guides/seo.md) guides.

## Add-on modules

Drop them in a **Free zone** section. The template set does not depend on them. The site must
enable each module, and `src/templates/addons.css` maps their styles onto the theme.

| Module                             | Verified                                                                                                               | Notes                                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Formidable (`formidable-elements`) | Forms placed with a Form reference                                                                                     | Fields, labels and messages styled by the template set                                                                         |
| `jsfaq`                            | FAQ with search, tag filter and expand / collapse                                                                      | Heading level chosen per FAQ; schema.org FAQPage                                                                               |
| `js-media-gallery`                 | Image galleries (picked or from a folder: carousel, masonry, grid), video gallery, featured and list views, video hero | Internal videos take captions and a transcript; YouTube and Vimeo play in frames the site's content security policy must allow |
| `js-store-locator`                 | Store search, list, map and store pages                                                                                | Follows the theme in light and dark; the map loads OpenStreetMap tiles                                                         |

None of them needs jExperience: enabling them on a site adds only the module itself. Use
[jsfaq 1.1.0](https://github.com/smonier/jsfaq/releases/tag/v1.1.0),
[js-media-gallery 1.1.0](https://github.com/smonier/js-media-gallery/releases/tag/1.1.0) and
[js-store-locator 1.1.0](https://github.com/smonier/js-store-locator/releases/tag/v1.1.0) or later:
these versions were reviewed and audited against RGAA 4.1.2 on the `classic-addons` demo site and
the Practical information page of `classic-dev`, in English and French, light and dark.

See the [add-ons guide](docs/guides/add-ons.md).

## Requirements

- Jahia 8.2.1.0 or later with `javascript-modules-engine` 1.2 or later.
- To build: Node.js 22 and Yarn 4 (pinned in `.yarn/releases`; enable it with `corepack enable`).
  For the Maven build: Java 17 and Maven 3.9.
- Recommended on sites: Jahia's `sitemap` module.

## Install and try it

```bash
yarn install
docker compose up --wait   # or use any local Jahia on http://localhost:8080
yarn build && yarn deploy  # build dist/package.tgz and install it on Jahia
```

`yarn deploy` reads `JAHIA_HOST` and `JAHIA_USER` from `.env` (copy `.env.example`; defaults:
`http://localhost:8080`, `root:root1234`).

Then create a site on the **classic-templates** template set, with English and French: the new site
already has a home page with its header and footer. Two scripts build local demonstration sites:

| Script                                                             | What it does                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `python3 scripts/seed-demo.py`                                     | Builds the `classic-dev` demo site: a fictional web studio with 18 pages in English and French, every component in use, news and articles with full texts, a demo taxonomy, a site map, a contact form, a legal notice, a privacy policy and an example accessibility statement (content in `scripts/demo_content.py`) |
| `python3 scripts/seed-demo.py --sections-only`                     | Adds the demo content to an existing site without changing what editors wrote, and publishes only what it added                                                                                                                                                                                                        |
| `python3 scripts/seed-demo.py --recreate`                          | Deletes and rebuilds the demo site (loses any edits made on it)                                                                                                                                                                                                                                                        |
| `python3 scripts/seed-addons.py`                                   | Builds the `classic-addons` demo site with the four add-on modules, each in a free zone                                                                                                                                                                                                                                |
| `python3 scripts/seed-addons.py --contact-only --site classic-dev` | Enables Formidable on a site and adds a contact form to its contact page                                                                                                                                                                                                                                               |

The scripts need Python 3 and Pillow, and read `JAHIA_URL` and `JAHIA_USER` (defaults as above).

## Development

| Command                         | Description                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `yarn build`                    | Type-check, build with Vite, pack `dist/package.tgz`                                                           |
| `yarn deploy`                   | Install `dist/package.tgz` on the Jahia instance                                                               |
| `yarn dev`                      | Watch mode: rebuild and redeploy on every change (for developers, in a terminal)                               |
| `yarn lint` / `yarn format`     | ESLint / Prettier                                                                                              |
| `yarn test:unit`                | Unit tests of the pure helpers (Vitest): URL checks, rich-text sanitizer, list queries, structured data, dates |
| `yarn check:tokens`             | Fails on any literal colour or primitive token outside `src/templates/tokens.css`                              |
| `yarn check:contrast`           | Checks WCAG AA contrast of every theme in light and dark                                                       |
| `mvn clean package`             | Same build through Maven, as the CI runs it (`target/classic-templates-<version>.tgz`)                         |
| `python3 scripts/make-icons.py` | Redraws the content-type icons (Pillow)                                                                        |

### Project layout

```
src/
  components/<Category>/<Name>/   one folder per content type: definition.cnd, types.ts, views, CSS module
  lib/                            shared helpers: links, images, headings, rich-text sanitizer, queries, structured data
  templates/                      Layout, page templates, main-resource template, breadcrumb, tokens, add-on bridge
settings/
  definitions.cnd                 namespaces (ctpl, ctplmix), base and shared mixins
  import.xml                      pages and folders seeded when a site is created
  locales/                        visitor-facing strings (en.json, fr.json)
  resources/                      editor labels and tooltips (.properties, EN and FR)
  content-editor-forms/           Content Editor form overrides
  content-types-icons/            one icon per content type
static/js/                        the menu's progressive enhancement (no framework)
scripts/                          demo seeding, icon drawing, token and contrast gates
docs/                             documentation for editors and administrators
tests/                            Cypress end-to-end tests (separate npm project)
.agents/                          decisions, gates and skills for AI-assisted development
```

### Quality gates

A change is done when every gate in [`.agents/context/gates.md`](.agents/context/gates.md) passes:
build, Maven build, unit tests, lint, Prettier, CND lint, tokens, contrast, static analysis
(Semgrep), Cypress, and the accessibility and SEO review of the demo pages in every theme and
scheme. The design decisions behind the code are recorded in
[`.agents/context/architecture.md`](.agents/context/architecture.md).

### Tests

```bash
cd tests
yarn install
JAHIA_URL=http://localhost:8080 SUPER_USER_PASSWORD=root1234 yarn e2e:ci
```

Each suite (smoke, foundations, chrome, content, sections, editorial) creates its own site on the
template set, covers the happy path, authorization and edge cases, and deletes the site afterwards.
In CI the suites run through the shared Jahia integration-test workflow
(`tests/provisioning-manifest-build.yml`), on every change and nightly against the release and
snapshot Jahia images.

## Contributing

- Pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/).
- A user-facing change adds a changelog fragment under `.chachalog/` (see
  `.github/instructions/changelog.instructions.md`). Never edit a CHANGELOG file by hand.
- New components follow [`.agents/skills/ctpl-add-component/SKILL.md`](.agents/skills/ctpl-add-component/SKILL.md):
  EN and FR labels with tooltips, tokens only, a Cypress suite, and a documentation page under
  `docs/components/`.
- Source files carry no license header; the root `LICENSE` applies to the whole repository.

## License

[MIT](LICENSE), copyright Jahia.
