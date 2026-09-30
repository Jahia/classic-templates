import { RenderChildren, getChildNodes, jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { Cta } from "../../../lib/Cta.js";
import { readString } from "../../../lib/props.js";
import { SectionHeading } from "../../../lib/Heading.js";
import { Section } from "../../../lib/Section.js";
import type { KeyFigureProps, Props } from "./types.js";
import classes from "./key-figures.module.css";

/** True when at least one figure has a value in this language (the others are not rendered). */
const hasFigures = (node: JCRNodeWrapper) =>
  getChildNodes(
    node,
    1,
    0,
    (n: JCRNodeWrapper) => n.isNodeType("ctpl:keyFigure") && Boolean(readString(n, "value")),
  ).length > 0;

/**
 * A row of key figures ("98% of editors satisfied"), with an optional heading and lead text. The
 * figures wrap from one to four per row. Nothing is rendered on the live site without a figure.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:keyFigures", displayName: "Key figures" },
  ({ "jcr:title": title, introText, ctplSurface }: Props, { currentNode, renderContext }) => {
    if (!renderContext.isEditMode() && !hasFigures(currentNode)) return null;
    const headingId = `ctpl-kf-${currentNode.getIdentifier()}`;
    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-key-figures"
        labelledBy={title ? headingId : undefined}
      >
        <div className="ctpl-container">
          {title && (
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          )}
          {introText && <p className={classes.intro}>{introText}</p>}
          <ul className={classes.figures}>
            <RenderChildren />
          </ul>
          <Cta node={currentNode} renderContext={renderContext} />
        </div>
      </Section>
    );
  },
);

/**
 * One figure. Value and label sit in one paragraph, so a screen reader reads them as one phrase
 * ("98% of editors satisfied"); the detail follows. A figure without a value in this language is
 * left out (edit mode says so).
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:keyFigure", displayName: "Key figure" },
  ({ value, label, detail }: KeyFigureProps, { renderContext }) => {
    const { t } = useTranslation();
    if (!value) {
      return renderContext.isEditMode() ? (
        <li className={classes.figure}>
          <p className="ctpl-edit-hint">{t("figures.noValue")}</p>
        </li>
      ) : null;
    }
    return (
      <li className={classes.figure} data-testid="ctpl-key-figure">
        <p className={classes.phrase}>
          <span className={classes.value}>{value}</span> {label && <span>{label}</span>}
        </p>
        {detail && <p className={classes.detail}>{detail}</p>}
      </li>
    );
  },
);
