# Architecture and decisions

## Decisions taken (2026-09-30)

| Topic             | Decision                                                                                                                                   | Why                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Name              | Module `classic-templates`, namespaces `ctpl` / `ctplmix`                                                                                  | Neutral, product-agnostic                                                                    |
| Repository        | Local only for now; JSEL `LICENSE`; no GitHub repo yet                                                                                     | If it goes public (MIT), only `LICENSE` and a product-lifecycle issue change                 |
| Build and CI      | Jahia standard, copied from luxe-jahia-demo: thin `pom.xml` around Vite, shared `jahia-modules-action` workflows, `tests/` Cypress project | What Cortex review and the shared Sonar/publish/release pipeline expect                      |
| Maven coordinates | `org.jahia.modules.javascript:classic-templates`, parent `org.jahia.modules:jahia-modules:8.2.1.0`                                         | Same as luxe; the Java-bundle rule (parent 8.2.0.0) does not apply to a JS module            |
| Theming           | Light + dark, `default` + 2 sample themes, picked on the site node                                                                         | Proves the tokens re-theme every component                                                   |
| Headings          | Template renders the one `<h1>` from `jcr:title`; heroes use `<h2>`; page "hide title" option hides the template `<h1>` visually           | Lighthouse and axe want exactly one `<h1>`; a hero reused on two pages must not duplicate it |
| Languages         | EN + FR                                                                                                                                    | Harness rule                                                                                 |
| Java              | None                                                                                                                                       | Nothing server-side that the JS engine cannot do                                             |

## Inspirations

- **tenant-portal** (`tnp`): tokens + CSS modules, `siteTheme` mixin stamping `<html data-*-theme>`,
  chrome owned by the home page, one `MainResource` template rendering `fullPage`, CSS-only mobile
  menu, cache-safe active navigation (inline script on `data-nav-path`), `notInNav` page mixin.
- **mysoprahr** (`shr`): GridRow with one area per column, jcrQuery edit-mode info panel and cache
  dependency, footer links via `linkTypeInitializer`.
- **Weaknesses not to repeat**: hardcoded hex colours, brand-named tokens, hardcoded `fr-FR` dates,
  hardcoded logo path, 2-level navigation, jcrQuery excluded nodes joined with `OR` of `<>` (always
  true with two or more exclusions), hardcoded jcrQuery type list.

## Planned type inventory

| Group                                      | Types                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared mixins (`settings/definitions.cnd`) | Built in phase 4: tiers `ctplmix:component` → `pageComponent` / `heroComponent` / `headerComponent` / `footerComponent`; areas `ctpl:heroArea`, `ctpl:pageArea`, `ctpl:headerArea`, `ctpl:footerArea`; `ctplmix:linkTo`, `ctplmix:cta`, `ctplmix:media`, `ctplmix:pageOptions` (on `jnt:page`), `ctplmix:siteSettings` (on `jnt:virtualsite`). No `seo` mixin: pages and main resources use their native `jcr:description`, the site its native `j:description` |
| Chrome                                     | `ctpl:siteHeader` (logo, dark logo, brand name, utility `linkList`, navigation settings), `ctpl:siteFooter` (link columns, legal text, copyright, social links)                                                                                                                                                                                                                                                                                                 |
| Content                                    | `ctpl:heroBanner`, `ctpl:imageText`, `ctpl:columns`, `ctpl:richText`, `ctpl:linkList` + `ctpl:link`, `ctpl:jcrQuery`, `ctpl:cardGrid` + `ctpl:card` / `ctpl:contentTeaser`, `ctpl:keyFigures` + `ctpl:keyFigure`, `ctpl:quote`, `ctpl:siteMap`                                                                                                                                                                                                                  |
| Main resources                             | `ctpl:news`, `ctpl:article`, each with `fullPage`, `card`, `compact` views                                                                                                                                                                                                                                                                                                                                                                                      |
| Templates                                  | `home`, `content` (optional hero area + main), `fullWidth`, and one `MainResource` template                                                                                                                                                                                                                                                                                                                                                                     |

## Layout

```
<html lang data-ctpl-theme data-ctpl-scheme>
  skip link → #main-content
  AbsoluteArea siteHeader  (parent = home page, readOnly="children")
    utility link list (right-aligned, above)
    logo · main navigation (3 levels, from the home page's children)
  <main id="main-content">
    home:      <h1> (hidden) · hero area · main area
    content:   hero area · <h1> · main area
    fullWidth: <h1> · main area
    main resource: the item's fullPage view (it renders its own <h1>)
  AbsoluteArea siteFooter  (parent = home page, readOnly="children")
```

## Theming

See the AIStartupKit context doc `jahia-theming-tokens.md`. Tokens are prefixed `--ctpl-`, in
`src/templates/tokens.css`. The site mixin `ctplmix:siteSettings` carries `ctplTheme` (`default`,
`ocean`, `terracotta`) and `ctplColorScheme` (`auto`, `light`, `dark`), stamped on `<html>` by the
Layout (only known values; the default look stamps nothing).

- **Light and dark without duplication:** every colour role is a `light-dark()` pair and
  `:root { color-scheme: light dark }`; `data-ctpl-scheme` only forces `color-scheme`. Jahia's CSS
  aggregation/minification keeps `light-dark()`, `color-mix()` and `clamp()` intact (checked on
  8.2.3.2). Browser support: Baseline 2024.
- **Contrast** is checked by `yarn check:contrast` for every theme × scheme (22 pairs each), and
  literal colours outside `tokens.css` by `yarn check:tokens`. Both were shown to fail on a
  deliberately broken token before being trusted.
- **Cache:** the Layout declares a cache dependency on the site node
  (`server.render.addCacheDependency({ node: site }, renderContext)`). Without it, publishing a new
  theme left cached live pages on the old one; with it, they switch on the first request after the
  publish.
- **Fonts** are system stacks (no web-font download, nothing to host or consent to). A theme can
  point `--ctpl-font-*` at self-hosted fonts in `static/`.

## Security notes (jahia-security-scan)

- Only rule R10 (`dangerouslySetInnerHTML`) can fire on a JS module, and it flags every use, even
  sanitised. Rich text goes through a single audited `RichText` component, so there is exactly one
  justified hit.
- **Rich text is sanitised at render time, not trusted from the repository.** Platform-side HTML filtering is a site setting the template set
  cannot count on. `src/lib/sanitize.ts` (js-xss,
  allow-list) keeps text formatting, lists (definition lists too), data tables with caption and
  header associations, figures, links, images, and the `lang`/`dir` of any element; drops scripts,
  styles, frames, event handlers, `class`/`style`, link `target`/`title` and image `title`;
  removes href/src/cite that is not http(s), mailto, tel, relative or a Jahia `##cms-context##`
  placeholder (so no `javascript:`, `data:` or `//host`); prefixes editor ids (`ctpl-rt-`) with
  the anchors and `headers` pointing at them; renumbers headings under the section's own heading
  (`RichText headingLevel`, from `useBodyHeadingLevel`) with no skipped level. Unit tests in
  `sanitize.test.ts`, end-to-end in the content edge-cases spec.
- No scanner rule covers these, so review them by hand: JCR-SQL2 built by concatenation (values
  only from choicelists, paths only from nodes), contributed URLs (scheme allow-list: `http`,
  `https`, `mailto`, `tel`), any server-side fetch.

## Links (settled by the phase 3 spike, 2026-09-30)

Tested on the local 8.2.3.2 with a throwaway module (namespace `lnkspk`, since removed). Details
and the verified matrix: AIStartupKit `.agents/context/jahia-link-patterns.md`.

- **Shape:** one shared mixin in `settings/definitions.cnd`, the native Jahia link picker:

  ```cnd
  [ctplmix:linkTo] mixin
   - j:linkType (string, choicelist[linkTypeInitializer,resourceBundle]) = 'none' autocreated indexed=no
  ```

  `internal` adds `jmix:internalLink` (page picker, `j:linknode`), `external` adds
  `jmix:externalLink` (`j:url`, `j:linkTitle`). Works on our own types, in the Content Editor, over
  GraphQL and in live rendering. The label is our own field (`ctaLabel (string) i18n` on
  `ctplmix:cta` = `linkTo` + label); `ctpl:link` (list item) = `mix:title` + `ctplmix:linkTo`, and
  an internal link without a title falls back to the target page's title.

- **The call to action is one reusable mixin, used two ways.** `ctplmix:cta` is a supertype where
  the component places the button in its own layout (hero banner, image and text, content list),
  and an optional mixin on every other section: `extends = ctplmix:sectionStyle`, so the edit form
  of any sectioned type (rich text, columns, and every new section) shows a "Call to action" toggle
  with the label and the link picker; types that already have it as a supertype show no duplicate
  toggle (checked in `forms.editForm`). Views end with `<Cta node renderContext />`, which renders
  nothing on a node without the mixin, edit mode included. There is no call-to-action banner type:
  a rich text on the accent surface with the call to action switched on is the banner.

- **Links are per language:** `j:linknode` and `j:url` are both i18n. A link set in EN has no target
  in FR. Views render the label without a link when the current language has no target (never
  `href="#"`), and in edit mode show a small "no link target in this language" hint so editors
  notice. Seeding scripts set the target for every language.
- **Writes:** always pass `language` for `j:linknode` / `j:url`. Without it the write is rejected
  and the `addMixins` of the same mutation is rolled back (the cause of tenant-portal's "mixin does
  not stick").
- **Security:** `j:url` is unconstrained, so one shared `resolveLink()` helper allow-lists `http`,
  `https`, `mailto`, `tel` and returns nothing for anything else. External links get
  `rel="noopener"` when they open a new tab.

## CND files

- Every component `definition.cnd` uses **exactly** the namespace URIs of `settings/definitions.cnd`
  (`http://www.jahia.org/classic-templates/nt/1.0` and `/mix/1.0`). The engine merges all CND files
  at install time; one prefix bound to two URIs fails the install with a bare `IOException` while
  `yarn deploy` prints `{}`. The `check-cnd.mjs` gate (`namespaceUriMismatch`) catches it.
- `settings/definitions.cnd` declares every prefix the module uses (`jnt`, `jmix`, `mix`, `j`,
  `jcr`, `ctpl`, `ctplmix`). Component CNDs carry the same header.

## Chrome (phase 5)

- **Header** (`ctpl:siteHeader`, singleton, `jmix:hiddenType`): named children `utilityLinks`
  (`ctpl:linkList`, rendered with its `inline` view in the right-aligned bar above),
  `languageSwitcher` and `navigation` (`ctpl:mainNavigation`). Logo + optional dark logo (swapped
  by CSS for forced or system dark), brand name defaulting to the site title.
- **Footer** (`ctpl:siteFooter`, singleton): tagline, `columns` (`ctpl:footerColumns` of titled
  `ctpl:linkList`s, `column` view), `legal` and `social` (`inline` view), copyright with a `{year}`
  token. Always shows the site name and copyright, so the landmark is never empty.
- **Links:** `ctpl:link` (`mix:title` + `ctplmix:linkTo` + `openInNewTab`) inside `ctpl:linkList`
  (default, `inline`, `column` views). A list without links renders nothing on the live site.
- **Main navigation:** built from the page tree under home by `src/lib/navigation.ts` (pages, menu
  labels, node links, external links with the scheme allow-list), 1 to 3 levels (`navDepth`),
  skipping pages with "Hide from navigation". Cache dependency on the whole tree under home.
- **Behaviour:** server-rendered and usable without JavaScript. `static/js/navigation.js` (loaded
  with `AddResources`) switches to the disclosure pattern: menu button on small screens, submenu
  buttons with `aria-expanded`, Escape / outside click / focus leaving an item closes, hover can
  be dismissed with Escape (WCAG 1.4.13), and `aria-current` on the current page. The current page
  is marked in the browser because the header is one cached fragment shared by every page.
- **Language switcher:** only languages the page exists in; `cache.mainResource` on its view so
  each page gets its own links inside the shared header (verified per page, EN and FR).
- **Breadcrumb** (Tier 1, `src/templates/Breadcrumb.tsx`): rendered by the page shell between the
  header and `<main>` (the skip link jumps over it), not a droppable type: it has nothing to
  contribute but page titles. Home first, the page tree down to the current page (marked
  `aria-current="page"`), a main resource outside the tree (a news item) gets Home > item. None on
  home. Off for the whole site with `ctplShowBreadcrumb` (site settings, on by default - a missing
  value on older sites counts as on) or per page with `ctplHideBreadcrumb` (page options).
  The trail comes from `breadcrumbOf`, shared with the JSON-LD `BreadcrumbList`, so both agree.
  Separators are drawn chevrons, so screen readers read no separator text. Every ancestor is a
  cache dependency.

## Content components (phase 6)

Types modelled by `/jahia-cnd-author` from a structured spec, then reviewed.

- **Shared helpers** (`src/lib/`): `Section` (surface from `ctplmix:sectionStyle`: default, sunken
  band, accent tint), `Cta` (the `ctplmix:cta` button: link resolution, allow-list, edit-mode hint
  when the label or the translated target is missing), `Image` (alt from the image's `jcr:title`,
  intrinsic `j:width`/`j:height` against layout shift, eager + high priority for the banner, lazy
  otherwise, cache dependency on the image), `SectionHeading` (h2, or h3 when the section sits in a
  column), `RichText` (the one raw-HTML sink).
- **Hero banner** (`ctpl:heroBanner`, hero area or main area): variants image (photo behind the
  text under the token overlay), split (text left, photo right) and plain (accent tint); any
  variant without a photo renders plain. Overlay medium/strong, height compact/medium/tall.
- **Image and text** (`ctpl:imageText`): image left or right, landscape/square/portrait crop,
  rich text body, optional CTA, section surface.
- **Rich text** (`ctpl:richText`): optional heading, body at reading measure or wide, optional
  call to action (the call-to-action banner, on the accent surface).
- **Columns** (`ctpl:columns`): halves, thirds, quarters, 2/3+1/3, 1/3+2/3; four autocreated
  `ctpl:column` child lists (each accepts page sections) of which the view renders as many as the
  layout needs, so switching layout never deletes content. Rendered with `RenderChild` of the named
  child lists, not AbsoluteAreas: each column shows up in Page Builder as a list restricted to
  `ctplmix:pageComponent` with its own add button (checked in the edit frame). Sections inside a
  column drop their own container gutter and step their heading down to h3.
- **JCR query**: see phase 7.

## Tier 1 sections (after phase 9)

- **Card grid** (`ctpl:cardGrid`, orderable list, 2/3/4 columns, optional heading and lead): mixes
  written cards (`ctpl:card`: image, title, text, link, optional link label) and teasers of existing
  news or articles (`ctpl:contentTeaser`: `j:node` from the editorial picker, constrained to
  `ctplmix:listable`, rendered with the item's own `card` view). A written card is one stretched
  title link; the link label is a visual cue with `aria-hidden` (the title is the accessible
  name); an untitled card with an internal link takes the target page's title. Nothing live
  without a card.
- **Card heading levels:** `useItemHeadingLevel` (`lib/Heading.tsx`) puts items one level below
  their section when it shows a title (h3, or h4 under a titled row), the section's level otherwise.
  `RenderChildren` passes no parameters, so each card works its level out from its parent, which is
  a cache dependency; a teaser passes the level on to the news card with `Render parameters`.
- **Key figures** (`ctpl:keyFigures` of `ctpl:keyFigure`: value as a string, label, detail): value
  and label in one paragraph, read as one phrase ("98% of editors satisfied"); auto-fit grid, 1 to 4
  per row. A figure without a value in the page's language is left out.
- **Quote** (`ctpl:quote`: quotation, author name, i18n role, portrait, standard or large):
  `figure` > `blockquote` + `figcaption`; quotation marks from CSS in the page's language (`quotes:
auto`, with the non-breaking spaces French needs inside « »), so editors type none; the portrait
  is decorative. No heading and no `mix:title`.
- **Site map** (`ctpl:siteMap`, `depth` 1-10): the visitor site map (plan du site), nested lists
  of every page under home, pages hidden from the menu included, built by `buildSiteMap` in
  `lib/navigation.ts` (same item types, scheme allow-list and tree cache dependency as the menu).
  With the menu it is the second navigation system RGAA 12.1 asks for (a breadcrumb does not
  count). It complements, and does not replace, **Jahia's sitemap module** (5.5.0 on the local
  instance): that module generates `sitemap.xml` for search engines (`jseomix:sitemap` on the
  site, `jseomix:noIndex` / `jseomix:noFollow` on pages) and has no visitor view (`jnt:sitemap` is
  a legacy hidden type without views). Pages marked `jseomix:noIndex` are left out of the visitor
  site map too, so both agree; the check is guarded, the module stays optional.
- All four are `ctplmix:sectionStyle` types, so each gets the optional call to action and ends
  with `<Cta>`. There is no call-to-action banner type (see the call-to-action decision above).

## News, articles and content lists (phase 7)

- **Types:** `ctpl:news` and `ctpl:article` (`jmix:mainResource`, `jmix:editorialContent`,
  `ctplmix:editorialItem` = teaser, body, publication date, image; articles add `author`). No tag or
  category field: Jahia offers both on every node, and the full page shows `j:tagList` and
  `j:defaultCategory` titles as "Topics" when present. Stored in `contents/news` and
  `contents/articles` (seeded by `import.xml`, `jmix:contributeMode` restricted to their type).
- **Views:** `fullPage` (meta line, the page's h1, lead, image, body, topics; used by the
  main-resource template, which falls back to the teaser for the meta description), `card` (the
  default view too) and `compact`. Dates in the page's language (`Intl.DateTimeFormat`, available
  in GraalJS); reading time for articles.
- **Content list** (`ctpl:jcrQuery`): type picked among the subtypes of `ctplmix:listable`
  (`choicelist[nodetypes='ctplmix:listable']`: news, article, or both via the shared mixin; this
  self-referencing initializer installs fine, unlike the `subnodetypes` fault in the harness notes),
  start folder or page, sort field and direction (allow-listed), 1-50 items, grid of cards or
  compact list, categories, excluded items, "no result" text, "see all" call to action.
  - **Edit panel** (`EditPanel.tsx`): the summary sentence ("Lists News item under contents/news,
    newest first, up to 3"), then every setting resolved to labels (type, start, sort, maximum,
    display, categories with the subcategory count, excluded titles), what the query found ("3
    shown of 6 matching", "+" when the 500-row edit count was reached), what it left out (excluded,
    not translated into the page's language), warnings (start folder set but gone, type not
    listable), and the JCR-SQL2 query in a `<details>`.
  - **Category filter** (`filterCategories`, a `category[autoSelectParent=false]` picker): a query
    criterion asked for by the user, not a category field on content. The selected categories and
    their subcategories (up to 200) become `(item.[j:defaultCategory] = 'uuid' OR ...)`; identifiers
    are checked against the UUID pattern before they reach the string. The OR form works on 8.2.3.2.
  - Card heading level is passed with `Render parameters={{ headingLevel }}` and read with
    `currentResource.getModuleParams()`: h3 under a titled list, h2 under an untitled one.
  - Items not translated into the page's language are skipped.
  - **Excluded items are filtered in code, not in the query:** on 8.2.3.2 `NOT ISSAMENODE(...)` in
    JCR-SQL2 is unreliable (GraphQL `nodesByQuery`: excluded nothing even with one condition;
    `getNodesByJCRQuery`: only the first of two). The Cypress regression test excludes two items.
  - `jmix:renderableList` (harness rule 11) brings an empty "Sub content view" field; a Content
    Editor form override (`settings/content-editor-forms/forms/ctpl_jcrQuery.json`) hides it.
  - Type labels for the summary come from Jahia's `NodeTypeRegistry` (via `Java.type`): the JCR
    type manager's node types carry no label.
  - A start node that is set but no longer resolves renders nothing on the live site (never the
    whole site) and a warning in edit mode.

## Structured data (JSON-LD)

- `templates/StructuredData.tsx`, rendered by the page shell on every page and main resource: one
  `<script type="application/ld+json">` with a schema.org `@graph` built by `lib/schema.ts` (pure,
  unit-tested): `Organization` (header brand name and logo, one `@id` across languages),
  `WebSite`, `WebPage` (name, description, language), `BreadcrumbList` when the trail shows, and
  `NewsArticle` / `Article` (`mainEntity` of the page) for `ctplmix:editorialItem` types: headline
  (110 characters), teaser, publication and modification dates, the image shown, the article's
  author (else the Organization), tags as keywords. A main resource of another module gets the
  page graph only.
- Absolute URLs from the request's scheme, host and port. Only what the page shows is described.
- No `dangerouslySetInnerHTML`: React 19 writes a `<script>`'s text unescaped (it only neutralises
  a closing `</script>`), and `jsonForScript` writes every `<` as `\u003c`, so no value can end
  the script. The scan still reports one sink (RichText).
- Pages with an add-on that emits its own JSON-LD (jsfaq's `FAQPage`) carry both blocks, which is
  valid.

## Accessibility (RGAA 4.1.2)

A manual RGAA audit (2026-09-30, twelve pages, six looks) found 11 template defects, all fixed:
focus ring over the hero photo (overlay colour), small-screen menu closing on Escape and focus
out, language links named after their visible code, page h1 before the hero, no teaser clamp
(10.12), per-use image alternative (`imageAlt`, a documented `cnd-check-ignore` of the upstream
`redundantImageAlt` rule) and a decorative switch, and the rich-text rules above. A site map
component gives the second navigation system (12.1). Site content, not the template set, owns the
accessibility statement and the "Accessibilité : ... conforme" mention: the demo seeds an example
of both, linked from the footer.

## Editor UI notes

- **Shared areas are editable on home only - but not with `readOnly="children"`.** Verified in the
  edit frame on 8.2.3.2 with engine 1.2.0: `"children"` (engine: `editable` + core
  `limitedAbsoluteAreaEdit`) locks the area AND its children on every page, home included;
  `readOnly={true}` only removes the area's own marker and leaves the children editable. PageShell
  therefore passes `false` on the home page and `"children"` everywhere else. The Cypress
  authorization spec for the chrome checks both sides.

- **Template names are not translatable:** the page editor's template picker shows the
  `displayName` of `jahiaComponent`. Core looks up
  `jmix_hasTemplateNode.j_templateName.<name>` in the module bundle, but with the JS engine 1.2.0
  those keys are ignored (tested). The names stay in English.
- **Empty shared areas are blank in the edit canvas:** an AbsoluteArea shows in Page Builder only
  once its node has a child. `import.xml` therefore seeds the header and footer singletons (phase 5),
  which also keeps the `<footer>` landmark from ever being empty.

## Open questions

None after Tier 1. Next: a free-zone section and a CSS token bridge so the jsfaq, js-media-gallery,
js-store-locator and formidable add-ons can be dropped into ctpl pages without a hard dependency.
