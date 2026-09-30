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

| Group                                      | Types                                                                                                                                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared mixins (`settings/definitions.cnd`) | `ctplmix:component`, `ctplmix:pageComponent`, `ctplmix:cta`, `ctplmix:media`, `ctplmix:seo`, `ctplmix:siteTheme` (on `jnt:virtualsite`), `ctplmix:pageOptions` (on `jnt:page`: hide from nav, hide title) |
| Chrome                                     | `ctpl:siteHeader` (logo, dark logo, brand name, utility `linkList`, navigation settings), `ctpl:siteFooter` (link columns, legal text, copyright, social links)                                           |
| Content                                    | `ctpl:heroBanner`, `ctpl:imageText`, `ctpl:columns`, `ctpl:richText`, `ctpl:linkList` + `ctpl:link`, `ctpl:jcrQuery`                                                                                      |
| Main resources                             | `ctpl:news`, `ctpl:article`, each with `fullPage`, `card`, `compact` views                                                                                                                                |
| Templates                                  | `home`, `content` (optional hero area + main), `fullWidth`, and one `MainResource` template                                                                                                               |

## Layout

```
<html lang data-ctpl-theme data-ctpl-scheme>
  skip link → #main-content
  AbsoluteArea siteHeader  (parent = home page, readOnly="children")
    utility link list (right-aligned, above)
    logo · main navigation (3 levels, from the home page's children)
  <main id="main-content">
    <h1> page title (visually hidden when the page hides its title)
    Areas of the template
  AbsoluteArea siteFooter  (parent = home page, readOnly="children")
```

## Theming

See the AIStartupKit context doc `jahia-theming-tokens.md`. Tokens are prefixed `--ctpl-`. The site
mixin carries `ctplTheme` (default, plus two samples) and `ctplColorScheme` (auto, light, dark).

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

## Open questions

- **Theme change and cache:** confirm that publishing the site node after a theme change refreshes
  cached pages.
