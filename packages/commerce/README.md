# classic-commerce

Shopping sections for sites built on the [classic-templates](../template-set/README.md) template
set: product views, a product carousel, a brand spotlight, a gift-with-purchase offer and a "shop
the look" section. Products are not stored in Jahia: they come live from Shopify through the
[shopify-edp](https://github.com/Jahia/shopify-edp) connector (an External Data Provider), which
mounts each shop as a folder of `shopynt:product` nodes.

## Install

Jahia 8.2.1.0 or later, `javascript-modules-engine` 1.3 or later, classic-templates and shopify-edp
installed. Then enable **classic-commerce** on a site that uses the template set. Configure the
connector (`org.jahia.se.modules.shopifyprovider.cfg`): one `<shop>:<admin API token>` entry per
market and the mount path. The configuration shipped with shopify-edp holds no shop and no token;
keep tokens out of any repository.

## Content types

| Type                            | What editors get                                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `shopynt:product` (shopify-edp) | Views `card` (default), `compact`, `fullPage`: brand, name, price in the shop's currency, image, description                                  |
| `ctcm:productCarousel`          | A row of product cards that scrolls sideways: picked products, or a shop folder filtered by a Shopify tag                                     |
| `ctcm:brandSpotlight`           | "Brand of the week": picture, eyebrow, brand name, text, call to action and picked products                                                   |
| `ctcm:giftOffer`                | A gift with purchase: gift, spend and currency, conditions, last day (leaves the live site after it)                                          |
| `ctcm:shopTheLook`              | A look's picture, name and introduction, with its products as a numbered list                                                                 |
| `ctcm:cartButton`               | The bag, for the header's utility links: "Add to bag" on product cards and pages, a drawer with quantities and subtotal, checkout in the shop |

### The bag

Place a **Bag** (`ctcm:cartButton`) in the header's utility links; its label is its title. Product
cards then show "Add to bag" (the cheapest variant) and product pages one button per variant
("Add Travel size, AED 295"). The bag lives in the visitor's browser, one per site; nothing about
the visitor is stored in Jahia. **Checkout** opens the shop's own cart with the items (a Shopify
cart permalink, `https://<shop>.myshopify.com/cart/<variant>:<quantity>,...`): the order, delivery
and payment happen in the shop. The buttons need shopify-edp 1.1 or later (the store address and
the variant names); a product that does not come from a shop has none, and a page without a bag
shows none. Where the site runs jExperience and the visitor is tracked, adding and checking out send
standard `click` events (target types `addToCart` and `checkout`) for segments and goals.

Every visible text is contributed content or a label of `settings/locales` (English, French,
Arabic). Pages in Arabic are laid out right to left by the template set.

## Build and develop

```bash
yarn install
yarn build && yarn deploy      # JAHIA_HOST and JAHIA_USER from .env
yarn lint && TZ=UTC yarn test:unit && yarn check:tokens
```

Never `yarn dev` from an agent. Rules, decisions and gates: [`.agents/context/commerce.md`](../../.agents/context/commerce.md).
