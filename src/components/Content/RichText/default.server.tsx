import { jahiaComponent } from "@jahia/javascript-modules-library";
import { Cta } from "../../../lib/Cta.js";
import { RichText } from "../../../lib/RichText.js";
import { SectionHeading, useBodyHeadingLevel } from "../../../lib/Heading.js";
import { Section } from "../../../lib/Section.js";
import type { Props } from "./types.js";
import classes from "./rich-text.module.css";

/**
 * A text section: an optional heading and the editor's rich text, at reading width or wide, and the
 * call to action when the editor switched it on (ctplmix:cta). On an accent surface with a call to
 * action, this is the site's call-to-action banner.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:richText", displayName: "Rich text" },
  ({ "jcr:title": title, body, width, ctplSurface }: Props, { currentNode, renderContext }) => {
    const headingId = `ctpl-rt-${currentNode.getIdentifier()}`;
    const bodyLevel = useBodyHeadingLevel(currentNode, Boolean(title));
    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-rich-text"
        labelledBy={title ? headingId : undefined}
      >
        <div className="ctpl-container">
          {title && (
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          )}
          <RichText
            html={body}
            headingLevel={bodyLevel}
            className={width === "wide" ? classes.wide : undefined}
          />
          <Cta node={currentNode} renderContext={renderContext} />
        </div>
      </Section>
    );
  },
);
