import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { Cta } from "../../../lib/Cta.js";
import { Image } from "../../../lib/Image.js";
import { RichText } from "../../../lib/RichText.js";
import { SectionHeading, useBodyHeadingLevel } from "../../../lib/Heading.js";
import { Section } from "../../../lib/Section.js";
import type { Props } from "./types.js";
import classes from "./image-text.module.css";

/**
 * An image beside a heading, rich text and a call to action. The image comes first in the source
 * (it stacks above the text on small screens); on large screens imagePosition puts it left or right.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:imageText", displayName: "Image and text" },
  (
    { "jcr:title": title, body, imagePosition, imageRatio, image, ctaLabel, ctplSurface }: Props,
    { currentNode, renderContext },
  ) => {
    const { t } = useTranslation("classic-templates");
    const headingId = `ctpl-it-${currentNode.getIdentifier()}`;
    const bodyLevel = useBodyHeadingLevel(currentNode, Boolean(title));
    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-image-text"
        labelledBy={title ? headingId : undefined}
      >
        <div
          className={[
            "ctpl-container",
            classes.grid,
            imagePosition === "right" ? classes.imageRight : classes.imageLeft,
          ].join(" ")}
        >
          <div className={`${classes.media} ${classes[imageRatio ?? "landscape"]}`}>
            {image ? (
              <Image node={image} owner={currentNode} renderContext={renderContext} />
            ) : (
              renderContext.isEditMode() && (
                <p className={classes.placeholder}>{t("image.missing")}</p>
              )
            )}
          </div>
          <div className={classes.text}>
            {title && (
              <SectionHeading node={currentNode} id={headingId}>
                {title}
              </SectionHeading>
            )}
            <RichText html={body} headingLevel={bodyLevel} />
            <Cta node={currentNode} label={ctaLabel} renderContext={renderContext} />
          </div>
        </div>
      </Section>
    );
  },
);
