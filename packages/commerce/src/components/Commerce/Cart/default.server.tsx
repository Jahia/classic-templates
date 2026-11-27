import { Island, jahiaComponent } from "@jahia/javascript-modules-library";
import Cart from "./Cart.client.jsx";
import classes from "./cart.module.css";
import type { Props } from "./types.js";

/**
 * The bag in a link list (the header's utility links): an <li> holding the cart island. The
 * fragment is the same for every visitor (the items live in the visitor's browser), so it caches
 * with the header. The bag is per site: its storage key is the page's own site, never the request's.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctcm:cartButton", displayName: "Bag" },
  (props: Props, { currentNode, renderContext }) => {
    const siteKey = renderContext.getMainResource().getNode().getResolveSite().getSiteKey();
    return (
      <li className={classes.item} data-testid="ctcm-cart">
        <Island
          component={Cart}
          props={{
            siteKey,
            label: props["jcr:title"] ?? "",
            idBase: `ctcm-cart-${currentNode.getIdentifier()}`,
            editMode: renderContext.isEditMode(),
          }}
        />
      </li>
    );
  },
);
