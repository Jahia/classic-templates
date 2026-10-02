import { jahiaComponent } from "@jahia/javascript-modules-library";
import { Card, Compact, FullPage, TileView, type EditorialProps, type Kind } from "./editorial.js";

/**
 * Registers the views of an editorial type. "fullPage" is used by the main-resource template at the
 * item's own URL; "card" and "compact" by content lists; "tile" by a card grid shown as icon tiles;
 * the default view is the card, for an item rendered anywhere else.
 */
export const registerEditorialViews = (nodeType: string, kind: Kind) => {
  const card = (props: EditorialProps) => <Card kind={kind} props={props} />;
  jahiaComponent({ componentType: "view", nodeType, displayName: "Card" }, card);
  jahiaComponent({ componentType: "view", nodeType, name: "card", displayName: "Card" }, card);
  jahiaComponent(
    { componentType: "view", nodeType, name: "compact", displayName: "Compact" },
    (props: EditorialProps) => <Compact kind={kind} props={props} />,
  );
  jahiaComponent(
    { componentType: "view", nodeType, name: "tile", displayName: "Tile" },
    (props: EditorialProps) => <TileView kind={kind} props={props} />,
  );
  jahiaComponent(
    { componentType: "view", nodeType, name: "fullPage", displayName: "Full page" },
    (props: EditorialProps) => <FullPage kind={kind} props={props} />,
  );
};
