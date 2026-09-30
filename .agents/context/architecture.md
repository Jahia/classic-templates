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
| Content                                    | `ctpl:heroBanner`, `ctpl:imageText`, `ctpl:columns`, `ctpl:richText`, `ctpl:linkList` + `ctpl:link`, `ctpl:jcrQuery`                                                                                                                                                                                                                                                                                                                                            |
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
  justified hit. Rich-text properties are filtered by Jahia's HTML filtering on save.
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

None at the end of phase 4.
