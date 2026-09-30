import { RenderChildren, jahiaComponent } from "@jahia/javascript-modules-library";
import { Cta } from "../../../lib/Cta.js";
import { SectionHeading } from "../../../lib/Heading.js";
import { Section } from "../../../lib/Section.js";
import type { Props } from "./types.js";
import classes from "./free-zone.module.css";

/**
 * A free zone: an optional heading, then whatever editors dropped (add-ons of other modules or core
 * content), at page width, reading width or full bleed. The `ctpl-addon` class scopes the token
 * bridge (templates/addons.css) so add-on styles follow the site theme, light and dark.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:freeZone", displayName: "Free zone" },
  ({ "jcr:title": title, width, ctplSurface }: Props, { currentNode, renderContext }) => {
    const headingId = `ctpl-fz-${currentNode.getIdentifier()}`;
    const full = width === "full";
    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-free-zone"
        labelledBy={title ? headingId : undefined}
      >
        {title && (
          <div className="ctpl-container">
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          </div>
        )}
        <div
          className={[
            "ctpl-addon",
            full ? undefined : "ctpl-container",
            width === "reading" ? classes.reading : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <RenderChildren />
        </div>
        <div className="ctpl-container">
          <Cta node={currentNode} renderContext={renderContext} />
        </div>
      </Section>
    );
  },
);
