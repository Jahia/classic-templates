import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useHeaderParts } from "./parts.js";
import { TwoRowsHeader } from "./TwoRowsHeader.js";
import type { Props } from "./types.js";

/**
 * The site header on two rows ("Two rows" in Layout > Select a view): the brand, the search box,
 * the utility links, the account entry and the languages on top, the main menu on its own row.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctpl:siteHeader",
    name: "twoRows",
    displayName: "Site header, two rows",
  },
  (props: Props, { currentNode, renderContext }) => (
    <TwoRowsHeader
      parts={useHeaderParts(props, currentNode, renderContext)}
      showSearch={props.showSearch}
    />
  ),
);
