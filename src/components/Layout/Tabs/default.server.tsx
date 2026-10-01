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
import { Section } from "../../../lib/Section.js";
import type { Props, TabProps } from "./types.js";
import classes from "./tabs.module.css";

/** True when at least one tab has a label in this language (the others are not rendered). */
const hasTabs = (node: JCRNodeWrapper) =>
  getChildNodes(
    node,
    1,
    0,
    (n: JCRNodeWrapper) => n.isNodeType("ctpl:tab") && Boolean(readString(n, "jcr:title")),
  ).length > 0;

/**
 * A section of tabs. The server renders every tab as a headed block, in order: that is what
 * visitors get without JavaScript, and what editors get in edit mode. static/js/tabs.js then
 * builds the ARIA tabs pattern from those blocks: a tablist of the labels, one panel shown at a
 * time, roving tabindex, arrow keys, Home and End, and the tab chosen by the address
 * (`#tab-<name>`, or anything inside a tab). The labels stay in the panels as headings, visually
 * hidden, so the outline of the page does not change. Nothing is rendered live without a tab.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:tabs", displayName: "Tabs" },
  ({ "jcr:title": title, ctplSurface }: Props, { currentNode, renderContext }) => {
    const isEdit = renderContext.isEditMode();
    if (!isEdit && !hasTabs(currentNode)) return null;
    const headingId = `ctpl-tabs-${currentNode.getIdentifier()}`;
    return (
      <Section surface={ctplSurface} testId="ctpl-tabs" labelledBy={title ? headingId : undefined}>
        <div className="ctpl-container">
          {title && (
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          )}
          <div
            className={classes.tabs}
            data-ctpl-tabs={isEdit ? undefined : ""}
            data-labelledby={title ? headingId : undefined}
          >
            {!isEdit && (
              <AddResources
                type="javascript"
                resources={buildModuleFileUrl("static/js/tabs.js")}
                key="ctpl-tabs"
              />
            )}
            <RenderChildren />
          </div>
          <Cta node={currentNode} renderContext={renderContext} />
        </div>
      </Section>
    );
  },
);

/**
 * One tab: its label as a heading (one level below the tabs title), then the sections dropped in
 * it, whose own headings come one level further down. Its id is built from the node name, so
 * `page.html#tab-<name>` selects it. Without a label in this language the tab is left out (edit
 * mode says so).
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:tab", displayName: "Tab" },
  ({ "jcr:title": title }: TabProps, { currentNode, renderContext }) => {
    const { t } = useTranslation();
    const Heading = headingTag(useItemHeadingLevel(currentNode));
    const isEdit = renderContext.isEditMode();
    if (!title && !isEdit) return null;
    return (
      <div
        className={classes.panel}
        id={anchorOf("tab-", currentNode.getName())}
        data-ctpl-tab-panel
        data-testid="ctpl-tab"
      >
        {title ? (
          <Heading className={classes.label} data-ctpl-tab-label>
            {title}
          </Heading>
        ) : (
          <p className="ctpl-edit-hint">{t("tabs.noTitle")}</p>
        )}
        <div className={classes.content}>
          <RenderChildren />
        </div>
      </div>
    );
  },
);
