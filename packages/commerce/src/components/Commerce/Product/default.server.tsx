import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import { ProductCard, ProductCompact, ProductFull } from "./views.js";

// Views of shopynt:product, the products of the shopify-edp connector, in the classic-templates
// look. "fullPage" is used by the classic-templates main-resource template at the product's own
// URL; "card" and "compact" by this module's sections and by content lists. The default view is
// the card. A view registered here on the connector's type replaces the connector's JSP view of
// the same name on sites that enable this module.
const card = (props: Props) => <ProductCard props={props} />;
jahiaComponent({ componentType: "view", nodeType: "shopynt:product", displayName: "Card" }, card);
jahiaComponent(
  { componentType: "view", nodeType: "shopynt:product", name: "card", displayName: "Card" },
  card,
);
jahiaComponent(
  { componentType: "view", nodeType: "shopynt:product", name: "compact", displayName: "Compact" },
  (props: Props) => <ProductCompact props={props} />,
);
jahiaComponent(
  {
    componentType: "view",
    nodeType: "shopynt:product",
    name: "fullPage",
    displayName: "Full page",
  },
  (props: Props) => <ProductFull props={props} />,
);
