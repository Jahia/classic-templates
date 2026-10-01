import {
  AddResources,
  RenderChildren,
  buildModuleFileUrl,
  getChildNodes,
  jahiaComponent,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { anchorOf } from "../../../lib/anchor.js";
import { Cta } from "../../../lib/Cta.js";
import { SectionHeading, headingTag, useItemHeadingLevel } from "../../../lib/Heading.js";
import { readString } from "../../../lib/props.js";
import { RichText } from "../../../lib/RichText.js";
import { Section } from "../../../lib/Section.js";
import type { ItemProps, Props } from "./types.js";
import classes from "./accordion.module.css";

/** True when at least one entry has a heading in this language (the others are not rendered). */
const hasItems = (node: JCRNodeWrapper) =>
  getChildNodes(
    node,
    1,
    0,
    (n: JCRNodeWrapper) =>
      n.isNodeType("ctpl:accordionItem") && Boolean(readString(n, "jcr:title")),
  ).length > 0;

/**
 * A section of entries that open and close, built on native <details>/<summary>: it works with
 * no JavaScript at all. static/js/accordion.js then adds an "Expand all / Collapse all" button
 * (hidden until the script runs) and opens the entry a link points at (`#acc-<name>`), on load and
 * when the address changes. In edit mode every entry renders open and flat, so editors see and
 * select everything. Nothing is rendered on the live site without an entry.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:accordion", displayName: "Accordion" },
  ({ "jcr:title": title, introText, ctplSurface }: Props, { currentNode, renderContext }) => {
    const { t } = useTranslation();
    const isEdit = renderContext.isEditMode();
    if (!isEdit && !hasItems(currentNode)) return null;
    const headingId = `ctpl-acc-${currentNode.getIdentifier()}`;
    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-accordion"
        labelledBy={title ? headingId : undefined}
      >
        <div className="ctpl-container">
          {title && (
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          )}
          {introText && <p className={classes.intro}>{introText}</p>}
          <div
            className={classes.accordion}
            data-ctpl-accordion
            data-expand-label={t("accordion.expandAll")}
            data-collapse-label={t("accordion.collapseAll")}
          >
            {!isEdit && (
              <>
                <AddResources
                  type="javascript"
                  resources={buildModuleFileUrl("static/js/accordion.js")}
                  key="ctpl-accordion"
                />
                <div className={classes.toolbar}>
                  <button type="button" className={classes.toggleAll} data-ctpl-accordion-all>
                    {t("accordion.expandAll")}
                  </button>
                </div>
              </>
            )}
            <div className={classes.items}>
              <RenderChildren />
            </div>
          </div>
          <Cta node={currentNode} renderContext={renderContext} />
        </div>
      </Section>
    );
  },
);

const Chevron = () => (
  <svg className={classes.chevron} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);

/**
 * One entry: the heading inside the <summary> (at the level below the accordion's title), the
 * answer as rich text one level further down. Its id is built from the node name, so
 * `page.html#acc-<name>` opens it. Without a heading in this language the entry is left out
 * (edit mode says so).
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:accordionItem", displayName: "Accordion entry" },
  ({ "jcr:title": title, body, openByDefault }: ItemProps, { currentNode, renderContext }) => {
    const { t } = useTranslation();
    const level = useItemHeadingLevel(currentNode);
    const Heading = headingTag(level);
    const isEdit = renderContext.isEditMode();
    if (!title) {
      return isEdit ? <p className="ctpl-edit-hint">{t("accordion.noTitle")}</p> : null;
    }
    const id = anchorOf("acc-", currentNode.getName());
    const answer = <RichText html={body} headingLevel={level + 1} />;
    if (isEdit) {
      return (
        <div className={classes.item} id={id} data-testid="ctpl-accordion-item">
          <div className={classes.summary}>
            <Heading className={classes.question}>{title}</Heading>
          </div>
          <div className={classes.answer}>{answer}</div>
        </div>
      );
    }
    return (
      <details
        className={classes.item}
        id={id}
        open={String(openByDefault) === "true"}
        data-ctpl-accordion-item
        data-testid="ctpl-accordion-item"
      >
        <summary className={classes.summary}>
          <Heading className={classes.question}>{title}</Heading>
          <Chevron />
        </summary>
        <div className={classes.answer}>{answer}</div>
      </details>
    );
  },
);
