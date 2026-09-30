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

## Open questions

- **Links on module types (phase 3 spike):** does `j:linkType` with `choicelist[linkTypeInitializer]`
  stick on our own types on Jahia 8.2.3.2? tenant-portal's CND says `jmix:internalLink` did not;
  mysoprahr's footer links use it. The answer decides the shape of `ctplmix:cta` and `ctpl:link`.
- **Theme change and cache:** confirm that publishing the site node after a theme change refreshes
  cached pages.
