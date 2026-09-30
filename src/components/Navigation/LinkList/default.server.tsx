import { RenderChildren, getChildNodes, jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../../../lib/Heading.js";
import type { Props } from "./types.js";
import classes from "./link-list.module.css";

/**
 * A list with no link renders nothing on the live site (no empty <nav>), but stays in edit mode.
 * Every view carries the list's node name (data-list-name), a stable hook for tests and styling
 * that does not change with the language.
 */
const isEmpty = (node: JCRNodeWrapper) =>
  getChildNodes(node, 1, 0, (n: JCRNodeWrapper) => n.isNodeType("ctpl:link")).length === 0;

/** Default: a titled section dropped in a page. */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:linkList", displayName: "Link list" },
  ({ "jcr:title": title }: Props, { currentNode, renderContext }) => {
    if (!renderContext.isEditMode() && isEmpty(currentNode)) return null;
    return (
      <section
        data-testid="ctpl-link-list"
        data-list-name={currentNode.getName()}
        aria-labelledby={title ? `ctpl-ll-${currentNode.getIdentifier()}` : undefined}
      >
        <div className="ctpl-container">
          {title && (
            <SectionHeading
              node={currentNode}
              id={`ctpl-ll-${currentNode.getIdentifier()}`}
              className={classes.sectionTitle}
            >
              {title}
            </SectionHeading>
          )}
          <ul className={classes.stacked}>
            <RenderChildren />
          </ul>
        </div>
      </section>
    );
  },
);

/** "inline": a horizontal bar of links (header utility links, footer legal and social links). */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:linkList", name: "inline", displayName: "Inline links" },
  ({ "jcr:title": title }: Props, { currentNode, renderContext }) => {
    const { t } = useTranslation();
    if (!renderContext.isEditMode() && isEmpty(currentNode)) return null;
    return (
      <nav
        aria-label={title || t("links.label")}
        data-testid="ctpl-link-list-inline"
        data-list-name={currentNode.getName()}
      >
        <ul className={classes.inline}>
          <RenderChildren />
        </ul>
      </nav>
    );
  },
);

/** "column": a titled column of links (footer). */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:linkList", name: "column", displayName: "Link column" },
  ({ "jcr:title": title }: Props, { currentNode, renderContext }) => {
    const { t } = useTranslation();
    if (!renderContext.isEditMode() && isEmpty(currentNode)) return null;
    const headingId = `ctpl-links-${currentNode.getIdentifier()}`;
    return (
      <nav
        className={classes.column}
        aria-labelledby={title ? headingId : undefined}
        aria-label={title ? undefined : t("links.label")}
        data-testid="ctpl-link-list-column"
        data-list-name={currentNode.getName()}
      >
        {title && (
          <h2 id={headingId} className={classes.columnTitle}>
            {title}
          </h2>
        )}
        <ul className={classes.stacked}>
          <RenderChildren />
        </ul>
      </nav>
    );
  },
);
