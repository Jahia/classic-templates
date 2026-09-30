---
name: ctpl-add-component
description: Module-specific checklist for adding a component to classic-templates (ctpl). Use together with the AIStartupKit /jahia-dev-build-component skill whenever a new content type, view or chrome element is added to this module.
---

# Adding a component to classic-templates

The generic pipeline is `/jahia-dev-build-component` (spec → `/jahia-cnd-author` → view → deploy →
review). This skill adds what is specific to this module. Follow both.

## 1. Spec

Write the spec block of `/jahia-dev-build-component` Step 1 and check it against
[`../../context/architecture.md`](../../context/architecture.md): is the type in the planned
inventory, which shared mixins does it reuse (`ctplmix:cta`, `ctplmix:media`, `ctplmix:seo`)?

## 2. Content type

- Folder: `src/components/<Category>/<Name>/` with `definition.cnd` and `types.ts`.
- Droppable in page areas: `> jnt:content, ctplmix:pageComponent` (and `mix:title` when it has a
  title). Chrome singletons (header, footer) add `jmix:hiddenType`; child items of a list never do.
- Links: `ctplmix:cta` (shape settled by the phase 3 spike, see architecture open questions). Never
  a plain `string` URL field.
- Images: `ctplmix:media` (weakreference to `jmix:image`); alt text comes from the image's `jcr:title`.
- Labels in the same step: `settings/resources/classic-templates_en.properties` and `_fr.properties`,
  a label and a `ui.tooltip` for the type and every field, choicelist values keyed with `_`.
- Icon: `settings/content-types-icons/ctpl_<name>.png` (32×32).
- Gate: `check-cnd.mjs .` reports PASS.

## 3. View

- `default.server.tsx` (plus named views), CSS module next to it.
- Root element carries `data-testid="ctpl-<name>"`; elements a test asserts on carry their own
  `data-testid`.
- Colours, fonts, spacing, radii, shadows: `var(--ctpl-…)` only. Component-local knobs are declared
  in the module CSS with a fallback to a semantic token.
- Headings start at `<h2>`; a heading level choice, when offered, never includes `h1`.
- Every visible string: a contributed field (with a null guard) or `t("key")` present in both
  `settings/locales/en.json` and `fr.json`.
- Rich text: the shared `RichText` component, never `dangerouslySetInnerHTML` directly.
- Contributed URLs: through the shared link helper (scheme allow-list).
- Interactive behaviour: a `.client.tsx` island with serialisable props, `useTranslation("classic-templates")`,
  rendered flat in edit mode.

## 4. Deploy and test

1. `yarn build && yarn deploy`, then check the bundle is `STARTED`.
2. Create or update `tests/cypress/e2e/<name>/` with `happy-path.cy.ts`, `authorization.cy.ts` and
   `edge-cases.cy.ts` (see `/jahia-dev-cypress`), using `siteKeyFor('<name>')` and
   `createTestSite` from `support/`. Include a French assertion and an empty-optional-fields case.
3. Run the specs against the local Jahia.

## 5. Done when

Every gate in [`../../context/gates.md`](../../context/gates.md) passes, including `/jahia-review`
on a page that shows the component in each theme and in dark mode.
