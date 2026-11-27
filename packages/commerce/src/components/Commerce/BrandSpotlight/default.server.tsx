import { jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Cta } from "../../../lib/Cta.js";
import { Heading, useHeadingLevel } from "../../../lib/Heading.js";
import { Image } from "../../../lib/Image.js";
import { innerLevel } from "../../../lib/level.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import { ProductTrack } from "../shared/ProductTrack.js";
import { Untitled } from "../shared/Untitled.js";
import classes from "./brand-spotlight.module.css";
import type { Props } from "./types.js";

/**
 * "Brand of the week": the brand's picture beside its eyebrow, name (the section heading), text
 * and call to action, then its picked products as a scrolling row of cards. Without a brand name
 * in this language the section renders nothing live.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctcm:brandSpotlight",
    displayName: "Brand spotlight",
    properties: { "cache.expiration": "600" },
  },
  (props: Props, { currentNode, renderContext }) => {
    const level = useHeadingLevel(currentNode);
    const title = props["jcr:title"];
    if (!title) return <Untitled message="brand.noTitle" />;
    const headingId = `ctcm-brand-${currentNode.getIdentifier()}`;
    const products = (props.products ?? []).filter((node): node is JCRNodeWrapper => Boolean(node));
    return (
      <Section surface={props.ctplSurface} testId="ctcm-brand-spotlight" labelledBy={headingId}>
        <Styles />
        <div className="ctpl-container">
          <div className={classes.intro}>
            {props.image && (
              <div className={classes.media}>
                <Image node={props.image} owner={currentNode} renderContext={renderContext} />
              </div>
            )}
            <div className={classes.text}>
              {props.eyebrow && <p className={classes.eyebrow}>{props.eyebrow}</p>}
              <Heading level={level} id={headingId} className={classes.title}>
                {title}
              </Heading>
              {props.text && <p className={classes.lead}>{props.text}</p>}
              <Cta node={currentNode} renderContext={renderContext} />
            </div>
          </div>
          {products.length > 0 && (
            <ProductTrack items={products} headingLevel={innerLevel(level, true)} />
          )}
        </div>
      </Section>
    );
  },
);
