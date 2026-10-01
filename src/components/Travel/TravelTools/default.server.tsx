import {
  AddResources,
  RenderChildren,
  buildModuleFileUrl,
  getChildNodes,
  jahiaComponent,
  server,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Cta } from "../../../lib/Cta.js";
import { Heading, sectionLevel, useHeadingLevel } from "../../../lib/Heading.js";
import { Image } from "../../../lib/Image.js";
import { innerLevel } from "../../../lib/level.js";
import { readString } from "../../../lib/props.js";
import { RichText } from "../../../lib/RichText.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import { Untitled } from "../shared/Untitled.js";
import type { Props, ToolProps } from "./types.js";
import classes from "./travel-tools.module.css";

/**
 * Level of a tool's heading: one below its section's heading when the section shows a title, the
 * section's own level otherwise. The section is a cache dependency (its title decides the level).
 */
const toolLevel = (tool: JCRNodeWrapper, renderContext: Parameters<typeof sectionLevel>[1]) => {
  try {
    const section = tool.getParent() as JCRNodeWrapper;
    server.render.addCacheDependency({ node: section }, renderContext);
    return innerLevel(
      sectionLevel(section, renderContext),
      Boolean(readString(section, "jcr:title")),
    );
  } catch {
    return 3;
  }
};

/**
 * One tool: its heading (the tab label once tabbed) with an optional decorative icon, its text,
 * its call to action. A tool without a title in this language is left out live (a tab needs a
 * name).
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctrv:travelTool", displayName: "Travel tool" },
  ({ "jcr:title": title, text, icon }: ToolProps, { currentNode, renderContext }) => {
    if (!title) return <Untitled />;
    const level = toolLevel(currentNode, renderContext);
    const id = `ctrv-tool-${currentNode.getIdentifier()}`;
    return (
      <section
        id={id}
        className={classes.tool}
        aria-labelledby={`${id}-title`}
        data-ctrv-tab-panel=""
        data-testid="ctrv-travel-tool"
      >
        <Styles />
        <Heading level={level} id={`${id}-title`} className={classes.toolTitle}>
          {icon && (
            <Image node={icon} renderContext={renderContext} className={classes.icon} decorative />
          )}
          <span data-ctrv-tab-label="">{title}</span>
        </Heading>
        <RichText html={text} headingLevel={level + 1} />
        <Cta node={currentNode} renderContext={renderContext} />
      </section>
    );
  },
);

/**
 * A section of travel tools: optional heading, the contributed notice (always visible, above the
 * tools), then the tools. Without JavaScript and in edit mode they are stacked sections, each with
 * its heading; on the live site static/js/travel-tools.js turns them into WAI-ARIA tabs (tab list
 * named by the section heading, arrow keys, Home and End), then the section's optional call to
 * action. Nothing live while there is no notice and no tool.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctrv:travelTools", displayName: "Travel tools" },
  ({ "jcr:title": title, notice, ctplSurface }: Props, { currentNode, renderContext }) => {
    const level = useHeadingLevel(currentNode);
    const isEdit = renderContext.isEditMode();
    const hasTools =
      getChildNodes(currentNode, -1, 0, (n: JCRNodeWrapper) => n.isNodeType("ctrv:travelTool"))
        .length > 0;
    if (!isEdit && !hasTools && !notice) return null;
    const headingId = `ctrv-tools-${currentNode.getIdentifier()}`;
    return (
      <Section
        surface={ctplSurface}
        testId="ctrv-travel-tools"
        labelledBy={title ? headingId : undefined}
      >
        <Styles />
        <div className="ctpl-container">
          {title && (
            <Heading level={level} id={headingId}>
              {title}
            </Heading>
          )}
          {notice && (
            <p className={classes.notice} data-testid="ctrv-travel-tools-notice">
              {notice}
            </p>
          )}
          <div
            className={classes.tools}
            data-ctrv-tabs={isEdit ? undefined : ""}
            data-ctrv-labelledby={title ? headingId : undefined}
          >
            <RenderChildren />
          </div>
          {/* ctplmix:cta can be switched on for any section (classic-templates sectionStyle). */}
          <Cta node={currentNode} renderContext={renderContext} variant="secondary" />
        </div>
        {!isEdit && (
          <AddResources
            type="javascript"
            resources={buildModuleFileUrl("static/js/travel-tools.js")}
            key="ctrv-travel-tools"
          />
        )}
      </Section>
    );
  },
);
