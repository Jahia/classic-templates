import { jahiaComponent } from "@jahia/javascript-modules-library";
import { Card, Compact, FullPage } from "../shared/editorial.js";
import type { Props } from "./types.js";

/**
 * Views of ctpl:news. "fullPage" is used by the main-resource template at the item's own URL;
 * "card" and "compact" by content lists; the default view is the card, for an item rendered
 * anywhere else.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:news", displayName: "Card" },
  (props: Props) => <Card kind="news" props={props} />,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:news", name: "card", displayName: "Card" },
  (props: Props) => <Card kind="news" props={props} />,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:news", name: "compact", displayName: "Compact" },
  (props: Props) => <Compact kind="news" props={props} />,
);
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:news", name: "fullPage", displayName: "Full page" },
  (props: Props) => <FullPage kind="news" props={props} />,
);
