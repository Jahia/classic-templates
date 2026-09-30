import { jahiaComponent } from "@jahia/javascript-modules-library";
import { RichText } from "../../../lib/RichText.js";
import { SectionHeading } from "../../../lib/Heading.js";
import { Section } from "../../../lib/Section.js";
import type { Props } from "./types.js";
import classes from "./rich-text.module.css";

/** A text section: an optional heading and the editor's rich text, at reading width or wide. */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:richText", displayName: "Rich text" },
  ({ "jcr:title": title, body, width, ctplSurface }: Props, { currentNode }) => {
    const headingId = `ctpl-rt-${currentNode.getIdentifier()}`;
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
          <RichText html={body} className={width === "wide" ? classes.wide : undefined} />
        </div>
      </Section>
    );
  },
);
