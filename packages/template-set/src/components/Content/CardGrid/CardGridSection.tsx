import { RenderChildren } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { Cta } from "../../../lib/Cta.js";
import { SectionHeading } from "../../../lib/Heading.js";
import { Section } from "../../../lib/Section.js";
import { hasVisibleCard } from "./cards.js";
import { childView, type Display } from "./display.js";
import type { Props } from "./types.js";
import classes from "./card-grid.module.css";

/**
 * The section every view of a card grid draws: the optional heading and lead text, the list of
 * cards and the call to action. `display` names the rendering, given by the view (default: cards;
 * iconTiles.server.tsx; logos.server.tsx): the children are rendered with the view of that name.
 * Nothing on the live site while the grid has no card that shows in it. This file registers no
 * view.
 */
export const CardGridSection = ({
  display,
  props: { "jcr:title": title, columns, introText, ctplSurface },
  currentNode,
  renderContext,
}: Readonly<{
  display: Display;
  props: Props;
  currentNode: JCRNodeWrapper;
  renderContext: RenderContext;
}>) => {
  if (!renderContext.isEditMode() && !hasVisibleCard(currentNode, display)) return null;
  const headingId = `ctpl-cards-${currentNode.getIdentifier()}`;
  return (
    <Section
      surface={ctplSurface}
      testId="ctpl-card-grid"
      labelledBy={title ? headingId : undefined}
    >
      <div className="ctpl-container">
        {title && (
          <SectionHeading node={currentNode} id={headingId}>
            {title}
          </SectionHeading>
        )}
        {introText && <p className={classes.intro}>{introText}</p>}
        <ul
          className={[classes.grid, classes[display], classes[`cols${columns ?? "3"}`]]
            .filter(Boolean)
            .join(" ")}
          data-display={display}
        >
          <RenderChildren view={childView(display)} />
        </ul>
        <Cta node={currentNode} renderContext={renderContext} />
      </div>
    </Section>
  );
};
