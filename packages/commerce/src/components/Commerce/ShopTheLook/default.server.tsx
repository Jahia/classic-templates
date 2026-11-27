import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Heading, useHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { Image } from "../../../lib/Image.js";
import { innerLevel } from "../../../lib/level.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import { Untitled } from "../shared/Untitled.js";
import classes from "./shop-the-look.module.css";
import type { Props } from "./types.js";

/**
 * "Shop the look": the look's picture beside its name (the section heading), introduction and the
 * products used in it, as an ordered list of compact rows (the order of application). Without a
 * name in this language the section renders nothing live.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctcm:shopTheLook",
    displayName: "Shop the look",
    properties: { "cache.expiration": "600" },
  },
  (props: Props, { currentNode, renderContext }) => {
    const t = useT();
    const level = useHeadingLevel(currentNode);
    const title = props["jcr:title"];
    if (!title) return <Untitled message="look.noTitle" />;
    const headingId = `ctcm-look-${currentNode.getIdentifier()}`;
    const products = (props.products ?? []).filter((node): node is JCRNodeWrapper => Boolean(node));
    return (
      <Section surface={props.ctplSurface} testId="ctcm-shop-the-look" labelledBy={headingId}>
        <Styles />
        <div className={`ctpl-container ${classes.look}`}>
          {props.image && (
            <div className={classes.media}>
              <Image node={props.image} owner={currentNode} renderContext={renderContext} />
            </div>
          )}
          <div className={classes.text}>
            <Heading level={level} id={headingId} className={classes.title}>
              {title}
            </Heading>
            {props.intro && <p className={classes.intro}>{props.intro}</p>}
            {products.length > 0 && (
              <ol className={classes.products} aria-label={t("look.products")}>
                {products.map((node) => (
                  <li key={node.getIdentifier()}>
                    <Render
                      node={node}
                      view="compact"
                      parameters={{ headingLevel: String(innerLevel(level, true)) }}
                    />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </Section>
    );
  },
);
