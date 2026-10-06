import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props as DestinationProps } from "../Destination/types.js";
import type { Props } from "./types.js";
import { DestinationMosaic, MosaicCard } from "./views.js";

jahiaComponent(
  { componentType: "view", nodeType: "ctrv:destinationMosaic", displayName: "Destination mosaic" },
  (props: Props) => <DestinationMosaic props={props} />,
);

// The card of a destination in the mosaic, rendered only by the mosaic.
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctrv:destination",
    name: "mosaicCard",
    displayName: "Mosaic card",
  },
  (props: DestinationProps) => <MosaicCard props={props} />,
);
