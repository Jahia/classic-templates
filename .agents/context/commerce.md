# classic-commerce: architecture, rules and gates

The module lives in `packages/commerce`. It follows the template set's conventions (heading policy,
theming tokens, link and media mixins, rich-text sanitizer) and the contract classic-travel has with
it: read [`travel.md`](travel.md) and [`architecture.md`](architecture.md) too.

## Non-negotiables

1. Namespaces are `ctcm` (types) and `ctcmmix` (mixins), URIs `http://www.jahia.org/classic-commerce/{nt,mix}/1.0`. Never rename them once content exists.
2. classic-templates and shopify-edp are declared dependencies (`package.json` `jahia.module-dependencies`). The `shopynt` prefix is declared with shopify-edp's own URI, never another.
3. Products are never copied into Jahia: views read `shopynt:product` nodes of the connector, by its property names (`jcr:title`, `bodyHtml`, `prices`, `currency`, `vendor`, `posterPath`, `shopyTags`, `productType`, `variantGqlIds`).
4. Shop data is data from another system: `bodyHtml` goes through the module's sanitizer (`RichText`), an image URL is kept only when it is `https` (`lib/product.ts`).
5. The connector sends no change event to Jahia: every view that shows products sets `cache.expiration` (600 s), the gift offer 3600 s (its last day).
6. No TypeScript import from classic-templates; helpers copied into `src/lib` are kept in step, as in classic-travel.
7. Every visible string is contributed content or a key in `settings/locales` (en, fr, ar, same keys); every type and field has EN and FR labels and a tooltip.
8. Deploy after each change: `yarn build && yarn deploy` from `packages/commerce`. Never `yarn dev` from an agent.

## Types

| Type | Supertypes (besides `jnt:content`) | Views |
| --- | --- | --- |
| `ctcm:productCarousel` | `mix:title`, `ctcmmix:pageComponent`, `ctplmix:sectionStyle`, `ctplmix:cta`, `ctcmmix:pickedProducts`, `jmix:list`, `jmix:renderableList`, `jmix:cache` | default |
| `ctcm:brandSpotlight` | `mix:title`, `ctcmmix:pageComponent`, `ctplmix:sectionStyle`, `ctplmix:media`, `ctplmix:cta`, `ctcmmix:pickedProducts` | default |
| `ctcm:giftOffer` | `mix:title`, `ctcmmix:pageComponent`, `ctplmix:sectionStyle`, `ctplmix:media`, `ctplmix:cta` | default |
| `ctcm:shopTheLook` | `mix:title`, `ctcmmix:pageComponent`, `ctplmix:sectionStyle`, `ctplmix:media`, `ctcmmix:pickedProducts` | default |
| `ctcm:cartButton` | `ctpl:link`, `ctcmmix:component` | default (an `<li>` holding the Cart island) |
| `shopynt:product` (shopify-edp) | - | default and card, compact, fullPage |

`ctcm:productCarousel.shopifyTag` is a query criterion on the shop's own tags, not a tag of the
content (CLAUDE.md rule 21, listing exception, asked for by the user on 2026-11-24).

## The bag

`ctcm:cartButton` extends `ctpl:link` so that the header's utility links (`+ * (ctpl:link)`) accept
it: no change to the template set's header. Its inherited link fields are hidden by
`settings/content-editor-forms/forms/ctcm_cartButton.json`. One island (`Cart.client.tsx`) draws
the button and the drawer (a modal `<dialog>`), reads the bag from `localStorage`
(`ctcm-bag:<siteKey>`, through `useSyncExternalStore`), and reveals and wires the "Add to bag"
buttons the product views render hidden (`src/lib/AddToBag.tsx`, data in `data-ctcm-add`). Every
value read from a button or from storage goes through `validEntry` (`src/lib/cart.ts`): https store
origin, digits-only variant, site path or https image. Checkout is a Shopify cart permalink per
store. A line keeps the name in the language it was added in.

## Gates

Those of the template set ([`gates.md`](gates.md)), run from `packages/commerce`: `yarn build`,
`TZ=UTC yarn test:unit`, `yarn lint && yarn prettier --check .`, `yarn check:tokens`, the CND
check, deploy and `ACTIVE`, the end-to-end specs under `tests/cypress/e2e/commerce/`.
