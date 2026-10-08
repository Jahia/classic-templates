# Architecture and decisions

The template set lives in `packages/template-set`. Paths below (`src/`, `settings/`, `static/`,
the build checks in `scripts/check-*.mjs` and `scripts/make-icons.py`) are relative to it; the
demo seeding scripts (`scripts/seed-*.py`), `tests/` and `docs/` are at the repository root.
classic-travel has its own page: [`travel.md`](travel.md).

## Decisions taken (2026-09-30)

| Topic                | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Why                                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                 | Module `classic-templates`, namespaces `ctpl` / `ctplmix`                                                                                                                                                                                                                                                                                                                                                                                                                              | Neutral, product-agnostic                                                                                                                                                               |
| Repository           | Public on GitHub, [Jahia/classic-templates](https://github.com/Jahia/classic-templates); MIT `LICENSE`                                                                                                                                                                                                                                                                                                                                                                                 | User decision 2026-09-30: public in the Jahia organisation, MIT, copyright Jahia                                                                                                        |
| Build and CI         | Jahia standard, copied from luxe-jahia-demo: thin `pom.xml` around Vite, shared `jahia-modules-action` workflows, `tests/` Cypress project; `demo-deploy.yml` deploys to the demo instance from the demo branches only (2026-10-08: a deploy from `main` replaced the demo build with a higher version); PRs that change no package skip build, Sonar and integration tests, and a newer run cancels an obsolete one on a PR or on `main`, never the release commit's run (2026-10-08) | What Cortex review and the shared Sonar/publish/release pipeline expect                                                                                                                 |
| Repository layout    | Monorepo (2026-10-02): root Maven aggregator `classic-templates-root`, `packages/template-set`, `packages/travel` (classic-travel imported with its history), `packages/prepackaged-site`, `packages/prepackaged-skylantern` (2026-10-06); one version for all                                                                                                                                                                                                                         | User decision: the template set, its travel companion and the demo site evolve and ship together; layout copied from luxe-jahia-demo                                                    |
| Maven coordinates    | `org.jahia.modules.javascript:classic-templates`, parent `classic-templates-root` (on `org.jahia.modules:jahia-modules:8.2.1.0`)                                                                                                                                                                                                                                                                                                                                                       | Same as luxe; the Java-bundle rule (parent 8.2.0.0) does not apply to a JS module                                                                                                       |
| Theming              | Light + dark, `default` + 5 sample themes, picked on the site node                                                                                                                                                                                                                                                                                                                                                                                                                     | Proves the tokens re-theme every component                                                                                                                                              |
| Headings             | Template renders the one `<h1>` from `jcr:title`; heroes use `<h2>`; page "hide title" option hides the template `<h1>` visually                                                                                                                                                                                                                                                                                                                                                       | Lighthouse and axe want exactly one `<h1>`; a hero reused on two pages must not duplicate it                                                                                            |
| Languages            | EN + FR                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Harness rule                                                                                                                                                                            |
| Pre-packaged site    | `org.jahia.community:classic-templates-prepackaged-website`, the `classic-dev` export stripped of add-on content by `scripts/export-prepackaged.py`, committed unzipped                                                                                                                                                                                                                                                                                                                | Installs with the template set alone; `org.jahia.community` avoids the signature check on unsigned `org.jahia.modules` bundles; diffs stay readable                                     |
| Pre-packaged airline | `org.jahia.community:skylantern-prepackaged-website` (2026-10-06), a separate bundle depending on classic-templates and classic-travel; same script with `--site skylantern`: jsfaq questions converted to `ctpl:accordion`, Formidable forms and js-store-locator offices removed, their texts rewritten                                                                                                                                                                              | Same rule as classic-dev (this repository's modules only); a separate bundle keeps classic-dev installable without classic-travel; converting the questions keeps the help centre whole |
| Java                 | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Nothing server-side that the JS engine cannot do                                                                                                                                        |

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
| Content                                    | `ctpl:heroBanner`, `ctpl:heroCarousel`, `ctpl:imageText`, `ctpl:columns`, `ctpl:richText`, `ctpl:linkList` + `ctpl:link`, `ctpl:jcrQuery`, `ctpl:noticeBar`, `ctpl:cardGrid` + `ctpl:card` / `ctpl:contentTeaser`, `ctpl:keyFigures` + `ctpl:keyFigure`, `ctpl:quote`, `ctpl:siteMap`, `ctpl:freeZone`, `ctpl:accordion` + `ctpl:accordionItem`, `ctpl:tabs` + `ctpl:tab`                                                                                       |
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
`ocean`, `terracotta`, `horizon`, `sage`, `slate`) and `ctplColorScheme` (`auto`, `light`, `dark`), stamped on `<html>` by the
Layout (only known values; the default look stamps nothing).

- **Light and dark without duplication:** every colour role is a `light-dark()` pair and
  `:root { color-scheme: light dark }`; `data-ctpl-scheme` only forces `color-scheme`. Jahia's CSS
  aggregation/minification keeps `light-dark()`, `color-mix()` and `clamp()` intact (checked on
  8.2.3.2). Browser support: Baseline 2024.
- **Emphasis role:** `--ctpl-color-highlight` (+ `--ctpl-color-text-on-highlight` for a filled
  badge) is for values that must stand out (key figures, prices). `:root` aliases it to the accent,
  so every theme has it; a theme that wants its own sets it (horizon: an orange, light first, with
  its own surfaces, text and borders). The alias resolves on `<html>`, where the theme block
  overrides the accent, so no theme has to repeat it. Sage (coral) and slate (green) also set their own.
- **Action role:** `--ctpl-color-action` (+ `-hover`, `--ctpl-color-text-on-action`) is for the call-to-action buttons (`lib/cta.module.css`, the Formidable primary button in `addons.css`). Aliased to the accent in `:root`, like the emphasis role, so only a theme that wants other button colours sets it (sage: coral, slate: green). Links, navigation, tabs and indicators keep the accent. `check-contrast.mjs` covers it for every theme and scheme.
- **Contrast** is checked by `yarn check:contrast` for every theme × scheme (30 pairs each), and
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
  (`RichText headingLevel`, from `useBodyHeadingLevel`) with no skipped level; wraps every table in
  a scroll region (`div.ctpl-table-scroll`, `role="region"`, `tabindex="0"`), named by
  `aria-labelledby` after its caption (which gets an id `<prefix>-caption-<n>`: editor ids start
  with a letter, so it never collides) or by `aria-label` from `tableLabel` ("Table", numbered when
  the block has several), so a wide table scrolls inside the text at 320 px (RGAA 10.11, axe
  `scrollable-region-focusable`). Two uncaptioned tables in two blocks of one page share the name
  "Table" (axe `landmark-unique`): the edit-mode hint asks for a caption. Unit tests in
  `sanitize.test.ts`, end-to-end in the content edge-cases and tables specs.
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
  an internal link without a title falls back to the target page's title. Every label read from
  a page title (links, cards, menu, site map, breadcrumb) goes through `lib/title.ts`: the title in
  the rendering language, else in the site's default language (read through a session in that
  language), so a newly added language never shows system names or URLs as labels.

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
- **Account entry** (sign in / sign out): `showAccount` (boolean, off) and `accountLanding` (page
  picker) on `ctpl:siteHeader`; the entry renders in the utility bar through the header's own
  `account` view (`Render node={currentNode} view="account"`, `account.server.tsx`), not a new child
  node, so existing headers need no migration. In edit mode the default view prints a plain "Sign in"
  instead (a nested `Render` of the same node adds a second Page Builder marker).
  - **URLs are platform routes, never contributed links:** `<contextPath>/cms/login?redirect=<path>`
    and `<contextPath>/cms/logout?redirect=<path>` (`src/lib/account.ts`; context path from
    `renderContext.getRequest().getContextPath()`). The `redirect` is only ever a site-relative path
    from `buildNodeUrl` (`safeLocalPath` refuses a scheme, `//host`, a backslash, whitespace).
    Jahia's `Login` accepts a redirect on the request's own host or an `authorizedRedirectHosts` entry
    (an absolute URL on another host still signs the user in but answers a bare 200 "OK" with no
    redirect, checked on 8.2.3.2), and `Logout` only follows a redirect that resolves to a node, else
    goes to `/`; both are open-redirect safe, but a
    site-relative path is the one form that survives a change of server name. A contributed absolute
    `http://<instance>/cms/login` external link works on one instance only: use the option instead.
  - **Cache:** the header is one shared fragment, so the server output never depends on the user.
    The server renders the guest version ("Sign in" link) plus the island `Account.client.tsx`,
    which POSTs `{ currentUser { username displayName } }` to `<contextPath>/modules/graphql` (same
    origin, session cookie; the browser adds the `Origin` header the endpoint requires) and swaps in
    the name and "Sign out" when the user is not `guest`; any failure keeps the sign-in link. The
    view has `cache.mainResource` (as the language switcher): the way back is the page being
    viewed, per page. The sign-in destination (`accountLanding`) is resolved in a system session
    (`asSystem` in `src/lib/access.ts`): it is typically a members page a guest cannot read, and a
    guest-rendered fragment must still carry it; the address is what the editor chose to publish in
    a public link. After sign-out the way back is the viewed page only when a guest can read it
    (`guestCanRead`, via `server.jcr.doExecuteAsGuest`), else the home page.
- **Links to pages the visitor cannot read (verified on 8.2.3.2, groups-signature ACL key):** Jahia's
  default `AclCacheKeyPartGenerator` (`useGroupsSignature=true`) keys every fragment on the
  visitor's principals that carry an ACE somewhere, so a header rendered for a member and one
  rendered for a guest are different fragments whenever any page grants or denies access to a
  group. A link or menu entry to a members page is therefore not served to a guest, in either order
  (tested: root and a plain member first, then a guest, and the reverse). What did go wrong: a
  `ctpl:link` whose target a guest cannot read registered no cache dependency (only a successful
  lookup did), so "no link" stayed cached after the page was opened or published. `resolveLink` now
  depends on the target's path, looked up in a system session. If a deployment switches to
  `org.jahia.aclCacheKeyPartGenerator.implementation=legacyAclCacheKeyPartGenerator` (node-level
  roles only), the ACL key no longer sees the target: add `cache.dependsOnReference: "j:linknode"`
  to the link view, and `cache.dependsOnVisibilityOf` to the menu. Not added: untestable here.
- **Breadcrumb** (Tier 1, `src/templates/Breadcrumb.tsx`): rendered by the page shell between the
  header and `<main>` (the skip link jumps over it), not a droppable type: it has nothing to
  contribute but page titles. Home first, the page tree down to the current page (marked
  `aria-current="page"`), a main resource outside the tree (a news item) goes through the page
  that lists it when its folder names one, else Home > item (see "Breadcrumb of items in content
  folders" below). None on home. Off for the whole site with `ctplShowBreadcrumb` (site settings, on by default - a missing
  value on older sites counts as on) or per page with `ctplHideBreadcrumb` (page options).
  The trail comes from `breadcrumbOf`, shared with the JSON-LD `BreadcrumbList`, so both agree.
  The home crumb reads the locale key `breadcrumb.home` (Home / Accueil), not the home page's
  `jcr:title`, which sites set to a search-engine title; its URL is unchanged. The site map keeps
  the title.
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
- **Card grid displays** (`display`: `cards`, `iconTiles`, `logos`): the grid renders its children
  with `RenderChildren view={display}` (none for cards), so each display is a named view of
  `ctpl:card` and `ctpl:contentTeaser` (`variants.server.tsx`); a teaser tile renders the item's
  own `tile` view, never its properties inline. Tiles (`lib/Tile.tsx`) are squares drawn by a
  `padding-top: 100%` pseudo-element in the content's grid cell: `aspect-ratio` widened a tile
  stretched to a taller neighbour (59 px of page overflow at 320 px). Logos sit on
  `--ctpl-color-surface-logo`, light in both schemes. Columns apply to cards only.
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

## Accordion and tabs (after 0.1.2)

- **Accordion** (`ctpl:accordion` of `ctpl:accordionItem`: `mix:title` heading, rich-text body,
  `openByDefault`): native `<details>`/`<summary>`, the heading inside the summary at
  `useItemHeadingLevel`, the body's headings one level further down. Works with no script;
  `static/js/accordion.js` adds "Expand all / Collapse all" (shown only once the script set
  `data-ctpl-ready`, labels from `data-*-label`, so it follows the page language) and opens the
  entry a URL hash points at, on load and on `hashchange`. Entry ids come from the node name
  (`anchorOf("acc-", name)`, `lib/anchor.ts`): readable, stable deep links. Edit mode renders the
  entries flat (no `<details>`), so a click selects instead of toggling.
- **Tabs** (`ctpl:tabs` of `ctpl:tab`: `mix:title` label + `+ * (ctplmix:pageComponent)`, a
  column-like list): the server renders every tab as a headed block (`data-ctpl-tab-panel`, label
  `data-ctpl-tab-label`, id `tab-<name>`), which is the no-script and edit-mode rendering;
  `static/js/tabs.js` builds the tablist from the labels (APG tabs, automatic activation, roving
  tabindex, arrows wrap, Home/End), labels the tablist with the section heading, hides the other
  panels and keeps each label as a visually hidden heading, so the outline does not change with
  the script. The URL hash selects the tab holding the target (an accordion entry too). The tablist
  is styled by its ARIA roles and states, never a hashed class.
- **Heading levels in containers** (`lib/Heading.tsx`): `sectionLevel` walks up columns, tabs and
  hero carousels (a column adds one under a titled row; a tab adds its label's level, one below a
  titled tabs section, plus one; a carousel slide adds one under a titled carousel), with every
  container as a cache dependency, clamped to h6; `headingTag` covers h2 to h6.

## Notice bar and hero carousel

- **Notice bar** (`ctpl:noticeBar`, `ctplmix:headerComponent` + `heroComponent` + `pageComponent`,
  listing mixins `jmix:list`/`renderableList`/`cache` like the content list, same form override):
  the latest 1-10 items (default 3) of a listable type under a start node and/or in categories,
  newest first, through `runList` (`lib/query.ts`), each a link plus a `<time>`; optional label
  (`label`, i18n, the region's name, else a hidden "Latest updates") and a "view all" `ctplmix:cta`
  rendered with the Cta `link` variant (text link, 44 px target). Static list, no rotation (RGAA
  13.8). A named `<section>` (region), never `<aside>`: in `<main>` a complementary landmark would
  fail axe `landmark-complementary-is-top-level`, and in the header area it must not be a second
  banner.
- **Layout:** one flex row when it fits: label (`flex: 0 1 auto`), items (`flex: 1 1 20rem`, so
  they take the room left instead of forcing the label and the actions onto rows of their own),
  actions (`flex: none`, pushed to the end). Long items wrap inside their column, each after a
  decorative dot; below the 20rem basis the items wrap under the label. At 1366 px the bar of three
  items is one row (70 px instead of 136), no sideways scroll at 320 px (Cypress).
- **Header integration:** no change to the header. The header area (`ctpl:headerArea`) already
  accepts any `ctplmix:headerComponent`, so the bar drops into it beside the `ctpl:siteHeader`
  singleton (before or after it, the area is orderable), editable on home only like the header,
  and outside the header's `<header>` landmark.
- **Dismiss:** `dismissible` adds `static/js/notice-bar.js` and a `<template>` holding the close
  button; the script clones it (no dead button without JavaScript), keeps the bar's items
  signature (`noticeSignature`, FNV-1a of the item ids) in `sessionStorage` (try/catch), so a new
  item shows the bar again, and moves focus to the next focusable element. Edit mode renders
  neither, so a bar dismissed while browsing is never hidden there.
- **Hero carousel** (`ctpl:heroCarousel`, `jmix:list` orderable, `+ * (ctpl:heroBanner)`): the
  slides are existing hero banners, not a slide type, so editors reuse every banner variant and the
  banner's image, overlay focus ring and CTA handling. `lib/Heading.tsx` puts a slide's heading one
  level below a titled carousel (hidden title included), with the carousel as cache dependency;
  only the first slide's photo loads with high priority.
- **Carousel behaviour** (`static/js/carousel.js`, loaded only live with two slides or more): sets
  `html.ctpl-js` from the page head, so the one-slide grid layout (every slide in one grid cell =
  height of the tallest, no layout shift) applies from the first paint. Controls are
  server-rendered `hidden` in the order they show (no flex `order`, so focus order = visual order,
  WCAG 2.4.3 / RGAA 12.8): the Pause/Play bar above the slides (autoplay only), previous / slide /
  next under them; both bars are laid out from the first paint, so their space is reserved. Hidden slides: `visibility: hidden` + `inert` + `aria-hidden`. Picker buttons
  carry `aria-current`, arrow keys / Home / End. A polite live region speaks visitor-made changes
  only (`aria-live="off"` while playing). Autoplay off by default; `interval` 5-30 s
  (`carouselInterval`, applied server-side again); one cycle back to the first slide then stop;
  suspended by hover, focus inside (not on the Pause button), hidden tab; stopped by any slide
  button; never started under `prefers-reduced-motion`, which also drops the fade. Pure helpers
  (`wrapIndex`, `keyTarget`, `delayOf`) are unit-tested by loading the script in a `node:vm`
  sandbox, where it hands them to `module.exports` and skips the DOM part.

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
  - **Item label** (`itemLabel`: `type`, the default and the previous output, or `category`):
    passed with `Render parameters={{ itemLabel }}` like the heading level and read by the item's
    `Meta` line (`useItemLabelMode`); `category` shows the first `j:defaultCategory` title in the
    page's language (each category a cache dependency), else the type. `lib/itemLabel.ts` holds the
    choice (unit-tested). The notice bar offers the same choice plus `none`, its default. Cards of a
    card grid and full pages keep the type.
  - **Excluded items are filtered in code, not in the query:** on 8.2.3.2 `NOT ISSAMENODE(...)` in
    JCR-SQL2 is unreliable (GraphQL `nodesByQuery`: excluded nothing even with one condition;
    `getNodesByJCRQuery`: only the first of two). The Cypress regression test excludes two items.
  - `jmix:renderableList` (harness rule 11) brings an empty "Sub content view" field; a Content
    Editor form override (`settings/content-editor-forms/forms/ctpl_jcrQuery.json`) hides it.
  - Type labels for the summary come from Jahia's `NodeTypeRegistry` (via `Java.type`): the JCR
    type manager's node types carry no label.
  - A start node that is set but no longer resolves renders nothing on the live site (never the
    whole site) and a warning in edit mode.

## Breadcrumb of items in content folders

- **Rule:** an item outside the page tree (any main resource in a content folder: news, articles,
  classic-travel destinations and fares) gets Home > the titled pages above the listing page > the
  listing page > the item. The listing page is named by the folder: optional mixin
  `ctplmix:listingPage` (`extends = jnt:contentFolder`, so the folder's edit form offers it as a
  switchable "Listing page" fieldset), property `ctplListingPage` (`weakreference`,
  `picker[type='page']`, `< jnt:page`). The nearest folder above the item that names a page of
  this site wins, so sub-folders inherit; none: Home > item, as before. The property carries the
  `ctpl` prefix like the other properties added to native types (`ctplHideBreadcrumb`, `ctplTheme`).
- **Why explicit, not guessed:** the list that shows a folder is not unique (two content lists, a
  notice bar, a list of another module such as `ctrv:destinationGrid` can all point at the same
  folder, or at a parent of it), and finding them is a reverse lookup over every list type's
  `startNode`, including types this module does not know. Its cache dependencies would be every list
  of the site. An editor-set reference is deterministic, cheap (a walk up a few folders) and cached
  like any node. So there is no reverse lookup; edit mode shows a hint (`breadcrumb.noListingPage`)
  on an item whose folders name no listing page.
- **Code:** `lib/trail.ts` builds the chain as pure functions over a small tree interface
  (`TrailTree`, unit-tested in `trail.test.ts`); `templates/Breadcrumb.tsx` implements it on JCR
  nodes. `breadcrumbOf` returns `{ crumbs, unlisted }`; the visible trail and the JSON-LD
  `BreadcrumbList` both read `crumbs`, so they stay identical. The site and page switches apply
  unchanged.
- **Ignored:** a listing page outside the site's home tree (another site), not a page, or not
  readable in the workspace (deleted, not published yet in live): the search goes on with the
  folders above. A listing page untitled in the language is left out like any untitled page; the
  home page as listing page gives Home > item (no repeated crumb).
- **Cache:** the item page depends on every content folder looked at (adding, changing or removing
  the mixin flushes the pages of the folder's items, verified by the Cypress edge case), on the
  listing page found and on every page linked. Nothing above the site node is read. A listing page
  published after its folder only shows once the folder (or the item) is published again.

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

## Add-on modules (free zone and token bridge)

- **`ctpl:freeZone`** (`+ * (jmix:droppableContent)`, heading, page / reading / full width): the
  one place where components of other modules go. Only core types are referenced, so the template
  set installs and runs without any add-on; page areas keep accepting `ctplmix:pageComponent` only.
- **`templates/addons.css`**, loaded with the global styles: maps the add-ons' CSS variables onto
  the theme's tokens (light-dark pairs, so dark mode follows), scoped to `.ctpl-addon` (a class
  beats their `:root` defaults), except Formidable's button variables, set on `:root` because its
  message button renders beside the form. Where an add-on paints outside its variables, the rule
  matches its CSS-module class on the stable local name (`[class*="_jsfaq-item_"]`), tied to the
  element, never on the hash. Measured, not guessed: every override answers an element found with
  a computed-style sweep in dark mode.
- Verified on the local `classic-addons` demo site (`scripts/seed-addons.py`: FAQ, gallery, store
  locator, contact form), axe + Lighthouse clean in light and dark, EN and FR:
  - **Formidable** (`formidable-elements`): fields, labels, help, messages styled by the template
    set as its docs intend (visible labels, `border-strong` 3:1 borders, the site focus ring);
    forms placed with a Form reference in a free zone.
  - **jsfaq**: its `--jsfaq-*` variables (surfaces and control borders included) mapped; its own
    focus tint replaced by the site ring (RGAA 10.7); only its width cap is overridden by class name.
  - **js-media-gallery**: its `--jsmg-*` variables mapped (text, surfaces, accent, focus, radius,
    shadows); media frames, overlays and scrims keep their own dark values.
  - **js-store-locator**: its `--jsstoreloc-*` variables mapped, and `--jsstoreloc-color-scheme` set
    from the site scheme (`light dark`, or the forced one from `data-ctpl-scheme`), so the panel
    follows dark mode; a value of `inherit` would not work: in a custom property it inherits the
    property itself. Leaflet tiles come from OpenStreetMap (a CSP must allow the tile server).
  - These variables come with the reviewed versions of the three modules (their
    `feat/accessibility-and-review` branches); older versions keep their own colours.
- None of the add-ons depends on jExperience (an earlier uncommitted `module-dependencies` line
  listed it; no code used it, and it was removed on 2026-10-01). classic-addons has one page per
  add-on; classic-dev shows them together on one page, Practical information
  (`scripts/seed-addons.py --site classic-dev --showcase`), and otherwise its own content (plus
  Formidable for its contact form). The demo site's RGAA statement does not cover that page; each
  module was reviewed and audited (RGAA 4.1.2) on its own, released as 1.1.0 on 2026-10-01.

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

None open. Possible next step: screen-reader testing (NVDA + Firefox, VoiceOver + Safari).
